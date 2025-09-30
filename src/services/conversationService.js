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
  const convoFiles = files.filter(
    (f) => f.name.includes('_') && f.name.endsWith('.json')
  );

  const convos = [];
  for (const f of convoFiles) {
    // Load conversation content to get ID and metadata
    const meta = {
      name: f.name,
      path: f.path,
      repo: repo.full_name
    };
    
    try {
      const fileRes = await fetch(f.url, { headers });
      if (fileRes.ok) {
        const blob = await fileRes.json();
        const decoded = JSON.parse(atob(blob.content));
        meta.id = decoded.id;
        meta.title = decoded.title;
        meta.createdAt = decoded.createdAt;
        meta.updatedAt = decoded.updatedAt || decoded.createdAt;
      } else {
        console.warn('[SkyGit] Could not load conversation file:', f.name);
        continue;
      }
    } catch (err) {
      console.warn('[SkyGit] Failed to load conversation content:', err);
      continue;
    }

    convos.push(meta);
  }

  setConversationsForRepo(repo.full_name, convos);
  repo.conversations = convos.map((c) => c.id);

  await commitRepoToGitHub(token, repo);
}

/**
 * Remove a conversation file from skygit-config/conversations/
 */
export async function removeFromSkyGitConversations(token, conversation) {
  console.log('[SkyGit] 🗑️ removeFromSkyGitConversations() called');
  console.log('⏩ Conversation to remove:', conversation);
  
  try {
    const username = await getGitHubUsername(token);
    const safeRepo = conversation.repo.replace(/\W+/g, '_');
    const safeTitle = conversation.title.replace(/\W+/g, '_');
    const path = `conversations/${safeRepo}_${safeTitle}.json`;

    // First, check if the file exists and get its SHA
    const checkRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!checkRes.ok) {
      console.log('[SkyGit] Conversation file not found in skygit-config, nothing to remove');
      return;
    }

    const existing = await checkRes.json();
    const sha = existing.sha;

    // Delete the file
    const deleteRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
      method: 'DELETE',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      },
      body: JSON.stringify({
        message: `Remove deleted conversation ${conversation.id}`,
        sha: sha
      })
    });

    if (!deleteRes.ok) {
      const errMsg = await deleteRes.text();
      console.warn(`[SkyGit] Failed to remove conversation from skygit-config: ${deleteRes.status} ${errMsg}`);
    } else {
      console.log('[SkyGit] ✅ Successfully removed conversation from skygit-config');
    }
  } catch (error) {
    console.warn('[SkyGit] Error removing conversation from skygit-config:', error);
  }
}

/**
 * Create a conversation mirror file in skygit-config/conversations/
 */
export async function commitToSkyGitConversations(token, conversation, usernameOverride = null) {
  console.log('[SkyGit] 📝 commitToSkyGitConversations() called');
  console.log('⏩ Payload:', conversation);
  const username = usernameOverride || await getGitHubUsername(token);
  const safeRepo = conversation.repo.replace(/\W+/g, '_');
  const safeTitle = conversation.title.replace(/\W+/g, '_');
  const path = `conversations/${safeRepo}_${safeTitle}.json`;
  const sanitized = {
    ...conversation,
    messages: (conversation.messages || []).map(({ pending, ...rest }) => rest)
  };
  const content = btoa(JSON.stringify(sanitized, null, 2));

  // Check if the file already exists to obtain its SHA for updates
  let sha = null;
  try {
    const checkRes = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });
    if (checkRes.ok) {
      const existing = await checkRes.json();
      sha = existing.sha;
    }
  } catch (_) {
    // ignore network errors here – will surface on PUT
  }

  const body = {
    message: `Add conversation ${conversation.id}`,
    content,
    ...(sha && { sha })
  };

  const res = await fetch(`https://api.github.com/repos/${username}/skygit-config/contents/${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json'
    },
    body: JSON.stringify(body),
    keepalive: true
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
  const safeRepo = repo.full_name.replace(/[\/\\]/g, '_').replace(/\W+/g, '_');
  const safeTitle = title.replace(/\W+/g, '_');
  
  // Use human-readable filename, check for conflicts
  let filename = `${safeRepo}_${safeTitle}.json`;
  let path = `.messages/${filename}`;
  let counter = 1;
  
  // Check if filename already exists with different conversation ID
  while (true) {
    try {
      const checkRes = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/${path}`, {
        headers: {
          Authorization: `token ${token}`,
          Accept: 'application/vnd.github+json'
        }
      });
      
      if (checkRes.ok) {
        const existing = await checkRes.json();
        const existingContent = JSON.parse(atob(existing.content));
        
        if (existingContent.id !== id) {
          // Different conversation exists, try with suffix
          filename = `${safeRepo}_${safeTitle}_${counter}.json`;
          path = `.messages/${filename}`;
          counter++;
          continue;
        }
      }
      // File doesn't exist or we found our own file, use this path
      break;
    } catch (_) {
      // Error checking file, assume it doesn't exist
      break;
    }
  }


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
