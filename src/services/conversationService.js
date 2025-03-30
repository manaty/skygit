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
 * Create a new conversation file in the GitHub repo
 */
export async function createConversation(token, repo, title) {
  const username = await getGitHubUsername(token);
  const id = uuidv4();
  const filename = `conversation-${id}.json`;
  const path = `.messages/${filename}`;
  const content = {
    id,
    title,
    createdAt: new Date().toISOString(),
    participants: [],
    messages: []
  };

  const base64 = btoa(JSON.stringify(content));
  await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
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

  const convoMeta = {
    id,
    name: filename,
    path,
    repo: repo.full_name
  };

  addConversation(convoMeta, repo);
}
