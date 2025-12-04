import { get } from 'svelte/store';
import { conversations, markMessagesCommitted, committedEvents } from '../stores/conversationStore.js';
import { authStore } from '../stores/authStore.js';
import { repoList } from '../stores/repoStore.js';
import { commitToSkyGitConversations } from './conversationService.js';
import { getGitHubUsername } from './githubApi.js';

const QUEUE_STORAGE_KEY = 'skygit_commit_queue';

// Load queue from localStorage
let savedQueue = [];
try {
    savedQueue = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) || '[]');
} catch (e) {
    console.warn('[SkyGit] Failed to load commit queue from storage:', e);
}

let queue = new Set(savedQueue);
let timers = new Map(); // one timer per repo+conversation
const BATCH_SIZE = 10;

function saveQueue() {
    try {
        localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(Array.from(queue)));
    } catch (e) {
        console.warn('[SkyGit] Failed to save commit queue to storage:', e);
    }
}

/**
 * Add a conversation (by repo + id) to the commit queue and debounce based on its frequency.
 */
export function queueConversationForCommit(repoName, convoId) {
    const key = `${repoName}::${convoId}`;
    if (!queue.has(key)) {
        queue.add(key);
        saveQueue();
    }

    // Auto flush if enough in queue
    if (queue.size >= BATCH_SIZE) {
        flushConversationCommitQueue();
        return;
    }

    const delay = getCommitDelayForRepo(repoName);
    if (!timers.has(key)) {
        const timer = setTimeout(() => {
            flushConversationCommitQueue([key]);
            timers.delete(key);
        }, delay);
        timers.set(key, timer);
    }
}

/**
 * Get commit delay from repo.config or default to 5 minutes.
 */
function getCommitDelayForRepo(repoName) {
    const repos = get(repoList);
    const repo = repos.find((r) => r.full_name === repoName);
    const mins = repo?.config?.commit_frequency_min ?? 5;
    return mins * 60 * 1000;
}

/**
 * Flush all or specific conversations from queue and commit to GitHub.
 */
export async function flushConversationCommitQueue(specificKeys = null) {
    // If specific keys are provided, we only try those.
    // Otherwise, we try everything currently in the queue.
    const keysToProcess = specificKeys || Array.from(queue);

    if (keysToProcess.length === 0) return;

    const token = localStorage.getItem('skygit_token');
    if (!token) return;

    const auth = get(authStore);
    const username = auth?.user?.login || await getGitHubUsername(token);
    const convoMap = get(conversations);

    for (const key of keysToProcess) {
        // Note: We do NOT delete from queue yet. We wait for success.

        const timer = timers.get(key);
        if (timer) {
            clearTimeout(timer);
            timers.delete(key);
        }

        const [repoName, convoId] = key.split('::');
        const convos = convoMap[repoName] || [];
        const convoMeta = convos.find((c) => c.id === convoId);

        if (!convoMeta || !convoMeta.messages || convoMeta.messages.length === 0) {
            console.warn('[SkyGit] Skipped empty or missing conversation:', key);
            // If it's missing or empty, we can probably remove it from queue to avoid infinite retries
            // unless it's just not loaded yet? Assuming if it's in convoMap it's loaded.
            if (convoMeta) {
                queue.delete(key);
                saveQueue();
            }
            continue;
        }

        // Check if there are actually any pending messages to commit
        const hasPending = convoMeta.messages.some(m => m.pending);
        if (!hasPending) {
            console.log('[SkyGit] No pending messages for', key, 'removing from queue');
            queue.delete(key);
            saveQueue();
            continue;
        }

        const conversation = {
            id: convoMeta.id,
            repo: repoName,
            title: convoMeta.title || `Conversation ${convoMeta.id}`,
            createdAt: convoMeta.createdAt || new Date().toISOString(),
            participants: convoMeta.participants || [],
            messages: convoMeta.messages
        };

        try {
            // 💾 Commit to target repo - use human-readable filename
            const safeRepo = conversation.repo.replace(/[\/\\]/g, '_').replace(/\W+/g, '_');
            const safeTitle = conversation.title.replace(/\W+/g, '_');
            let filename = `${safeRepo}_${safeTitle}.json`;
            let path = `.messages/${filename}`;

            // Check for filename conflicts and get SHA if it's the same conversation
            let sha = null;
            let remoteConversation = null;
            let counter = 1;

            // We need to find the correct file path first
            // This logic tries to find the existing file for this conversation ID
            // Optimization: If we already know the path from convoMeta, use it? 
            // But convoMeta.path might be stale if we renamed it (unlikely).
            // Let's stick to the existing robust lookup for now.

            while (true) {
                try {
                    const checkRes = await fetch(`https://api.github.com/repos/${repoName}/contents/${path}`, {
                        headers: {
                            Authorization: `token ${token}`,
                            Accept: 'application/vnd.github+json'
                        }
                    });

                    if (checkRes.ok) {
                        const existing = await checkRes.json();
                        const existingContent = JSON.parse(atob(existing.content));

                        if (existingContent.id === conversation.id) {
                            // Same conversation, we need to merge messages
                            sha = existing.sha;
                            remoteConversation = existingContent;
                            break;
                        } else {
                            // Different conversation with same name, try with suffix
                            filename = `${safeRepo}_${safeTitle}_${counter}.json`;
                            path = `.messages/${filename}`;
                            counter++;
                            continue;
                        }
                    } else {
                        // File doesn't exist, we can use this name
                        break;
                    }
                } catch (_) {
                    // Error checking file, assume it doesn't exist
                    break;
                }
            }

            // Merge messages if we have a remote version
            let finalConversation = conversation;
            if (remoteConversation && remoteConversation.messages) {
                // Create a map of message IDs to avoid duplicates
                const messageMap = new Map();

                // Add remote messages first
                remoteConversation.messages.forEach(msg => {
                    if (msg.id) {
                        messageMap.set(msg.id, msg);
                    }
                });

                // Add/update with local messages
                conversation.messages.forEach(msg => {
                    if (msg.id) {
                        messageMap.set(msg.id, msg);
                    }
                });

                // Sort messages by timestamp
                const mergedMessages = Array.from(messageMap.values())
                    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

                // Update conversation with merged messages
                finalConversation = {
                    ...conversation,
                    messages: mergedMessages,
                    participants: Array.from(new Set([
                        ...(remoteConversation.participants || []),
                        ...(conversation.participants || [])
                    ]))
                };

                console.log(`[SkyGit] Merged ${remoteConversation.messages.length} remote + ${conversation.messages.length} local = ${mergedMessages.length} total messages`);
            }

            const committedMessages = (finalConversation.messages || []).map((msg) => ({ pending: false, ...msg }));
            finalConversation = {
                ...finalConversation,
                messages: committedMessages
            };

            // Commit the merged conversation
            const serializedConversation = {
                ...finalConversation,
                messages: finalConversation.messages.map(({ pending, ...rest }) => rest)
            };
            const payload = btoa(JSON.stringify(serializedConversation, null, 2));

            const body = {
                message: `Update conversation ${conversation.id}`,
                content: payload,
                ...(sha && { sha })
            };

            // 💾 CRITICAL: Commit to target repo FIRST (primary source of truth)
            const res = await fetch(`https://api.github.com/repos/${repoName}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github+json'
                },
                body: JSON.stringify(body),
                keepalive: true
            });

            if (!res.ok) {
                const err = await res.text();
                console.error(`[SkyGit] Failed to commit to target repo ${repoName}:`, err);
                // DO NOT remove from queue if failed
                throw new Error(`GitHub commit failed: ${res.status} ${err}`);
            } else {
                console.log('[SkyGit] Successfully committed conversation:', key);

                // ✅ Success! Now we can remove from queue
                queue.delete(key);
                saveQueue();

                // 💾 After successful commit to target repo, update skygit-config mirror
                // This is best-effort - if it fails, the target repo still has the data
                try {
                    await commitToSkyGitConversations(token, serializedConversation, username);
                } catch (mirrorErr) {
                    console.warn('[SkyGit] Failed to mirror to skygit-config (non-critical):', mirrorErr);
                }

                conversations.update((map) => {
                    const list = map[repoName] || [];
                    const updatedList = list.map((c) => {
                        if (c.id === convoId) {
                            return {
                                ...c,
                                messages: finalConversation.messages,
                                participants: finalConversation.participants,
                                updatedAt: Date.now()
                            };
                        }
                        return c;
                    });
                    return { ...map, [repoName]: updatedList };
                });

                markMessagesCommitted(convoId, repoName, finalConversation.messages.map((m) => m.id));

                // Notify peers about the commit
                committedEvents.set({
                    repoName,
                    convoId,
                    messageIds: finalConversation.messages.map((m) => m.id)
                });
            }
        } catch (err) {
            console.error('[SkyGit] Conversation commit failed, keeping in queue:', err);
            // Item remains in queue and will be retried on next flush or reload
        }
    }
}

export function hasPendingConversationCommits() {
    return queue.size > 0;
}
