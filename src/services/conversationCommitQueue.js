import { get } from 'svelte/store';
import { conversations } from '../stores/conversationStore.js';
import { repoList } from '../stores/repoStore.js';
import { commitToSkyGitConversations } from './conversationService.js';
import { getGitHubUsername } from './githubApi.js';

let queue = new Set();
let timers = new Map(); // one timer per repo+conversation
const BATCH_SIZE = 10;

/**
 * Add a conversation (by repo + id) to the commit queue and debounce based on its frequency.
 */
export function queueConversationForCommit(repoName, convoId) {
    const key = `${repoName}::${convoId}`;
    queue.add(key);

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
    const keys = specificKeys || Array.from(queue);
    if (keys.length === 0) return;

    const token = localStorage.getItem('skygit_token');
    if (!token) return;

    const username = await getGitHubUsername(token);
    const convoMap = get(conversations);

    for (const key of keys) {
        queue.delete(key);
        timers.delete(key);

        const [repoName, convoId] = key.split('::');
        const convos = convoMap[repoName] || [];
        const convoMeta = convos.find((c) => c.id === convoId);

        if (!convoMeta || !convoMeta.messages || convoMeta.messages.length === 0) {
            console.warn('[SkyGit] Skipped empty or missing conversation:', key);
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
            // 💾 Commit to skygit-config mirror
            await commitToSkyGitConversations(token, conversation);

            // 💾 Commit to target repo - use human-readable filename
            const safeRepo = conversation.repo.replace(/[\/\\]/g, '_').replace(/\W+/g, '_');
            const safeTitle = conversation.title.replace(/\W+/g, '_');
            let filename = `${safeRepo}_${safeTitle}.json`;
            let path = `.messages/${filename}`;
            const payload = btoa(JSON.stringify(conversation, null, 2));

            // Check for filename conflicts and get SHA if it's the same conversation
            let sha = null;
            let counter = 1;
            
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
                            // Same conversation, we can update it
                            sha = existing.sha;
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

            const body = {
                message: `Update conversation ${conversation.id}`,
                content: payload,
                ...(sha && { sha })
            };

            const res = await fetch(`https://api.github.com/repos/${repoName}/contents/${path}`, {
                method: 'PUT',
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github+json'
                },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const err = await res.text();
                console.error(`[SkyGit] Failed to commit to target repo ${repoName}:`, err);
            }
        } catch (err) {
            console.error('[SkyGit] Conversation commit failed:', err);
        }
    }
}

export function hasPendingConversationCommits() {
    return queue.size > 0;
}
