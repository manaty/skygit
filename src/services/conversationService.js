import { setConversationsForRepo, addConversation } from '../stores/conversationStore.js';
import { commitRepoToGitHub, getGitHubUsername } from './githubApi.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Discover all `.messages/conversation-*.json` in the repo
 */
export async function discoverConversations(token, repo) {
  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github+json'
  };

  const path = `https://api.github.com/repos/${repo.full_name}/contents/.messages`;
  const res = await fetch(path, { headers });
  if (!res.ok) return;

  const files = await res.json();
  const convos = files
    .filter(f => f.name.startsWith('conversation-') && f.name.endsWith('.json'))
    .map(f => ({
      id: f.name.replace('conversation-', '').replace('.json', ''),
      name: f.name,
      path: f.path,
      repo: repo.full_name
    }));

  setConversationsForRepo(repo.full_name, convos);
  repo.conversations = convos.map(c => c.id);

  await commitRepoToGitHub(token, repo);
}

/**
 * Create a conversation mirror file in skygit-config/conversations/
 */
export async function commitToSkyGitConversations(token, conversation) {
  console.log('[SkyGit] 📝 commitToSkyGitConversations() called');
  console.log('⏩ Payload:', conversation);
  const username = await getGitHubUsername(token);
  const safeRepo = conversation.repo.replace(/\W+/g, '_');
  const safeTitle = conversation.title.replace(/\W+/g, '_');
  const path = `conversations/${safeRepo}_${safeTitle}.json`;
  const content = btoa(JSON.stringify(conversation, null, 2));

  const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json'
    },
    body: JSON.stringify({
      message: `Add conversation ${conversation.id}`,
      content
    })
  });

  if (!res.ok) {
    const errMsg = await res.text();
    throw new Error(`[SkyGit] Failed to commit to skygit-config: ${res.status} ${errMsg}`);
  }
}

/**
 * Create a new conversation file in the GitHub repo
 */
export async function createConversation(token, repo, title) {
  console.log('[SkyGit] 🔧 createConversation called for:', repo.full_name, 'with title:', title);
  const username = await getGitHubUsername(token);
  const id = uuidv4();
  const safeRepo = repo.full_name.replace(/\W+/g, '_');
  const safeTitle = title.replace(/\W+/g, '_');
  const filename = `conversation-${id}.json`;
  const path = `.messages/${filename}`;


  const content = {
    id,
    repo: repo.full_name,
    title,
    createdAt: new Date().toISOString(),
    participants: [],
    messages: []
  };

  const base64 = btoa(JSON.stringify(content));
  const res = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json'
    },
    body: JSON.stringify({
      message: `Create new conversation ${id}`,
      content: base64
    })
  });

  if (!res.ok) {
    const errMsg = await res.text();
    throw new Error(`[SkyGit] Failed to write conversation to ${repo.full_name}: ${res.status} ${errMsg}`);
  }

  try {
    console.log('[SkyGit] 📤 Now committing to skygit-config...');

    await commitToSkyGitConversations(token, content);
  } catch (err) {
    console.warn('[SkyGit] Failed to mirror conversation to skygit-config:', err);
  }

  const convoMeta = {
    id,
    name: filename,
    path,
    repo: repo.full_name,
    title
  };

  addConversation(convoMeta, repo);
}
