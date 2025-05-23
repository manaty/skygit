from: README.md

## Project Structure

```
skygit/
├── package.json            # Project metadata and scripts
├── vite.config.js          # Vite build configuration
├── svelte.config.js        # Svelte preprocessor configuration
├── jsconfig.json           # IDE / TypeScript settings
├── public/                 # Static assets served at root
│   └── favicon.png         # Favicon image
├── images/                 # Logos and icons
│   └── skygit_logo.png     # Application logo
├── index.html              # SPA entry point
└── src/                    # Application source code
    ├── main.js             # Mounts App.svelte
    ├── app.css             # Global styles (optional)
    ├── App.svelte          # Root component & routing logic
    ├── routes/             # Top-level page components
    │   ├── Home.svelte
    │   ├── Chats.svelte
    │   ├── Repos.svelte
    │   └── Settings.svelte
    ├── components/         # Reusable UI components
    │   ├── LoginWithPAT.svelte
    │   ├── RepoConsent.svelte
    │   ├── Sidebar.svelte
    │   ├── MessageList.svelte
    │   ├── MessageInput.svelte
    │   └── ...
    ├── stores/             # Svelte writable stores for state
    │   ├── authStore.js
    │   ├── routeStore.js
    │   ├── syncStateStore.js
    │   ├── repoStore.js
    │   └── conversationStore.js
    ├── services/           # Core logic & GitHub integration
    │   ├── peerJsManager.js    # PeerJS peer-to-peer connections
    │   ├── githubToken.js
    │   ├── githubApi.js
    │   ├── githubRepoDiscovery.js
    │   ├── startupService.js
    │   ├── conversationService.js
    │   ├── conversationCommitQueue.js
    │   └── encryption.js
    └── utils/              # Utility functions and directives
        └── clickOutside.js
``` 

---

# **1. Root Files**

## `package.json`
**Purpose**  
- Defines project metadata (name, version) and dependencies for Svelte, Vite, etc.  
- Specifies scripts for building, running dev server, or deploying (e.g. `npm run dev`, `npm run build`).

**Key Dependencies** (examples)  
- `"svelte"` (core framework)  
- `"vite"` and `"@sveltejs/vite-plugin-svelte"` (build tool + Svelte plugin)  
- `"simple-peer"` (for WebRTC)  
- `"@octokit/rest"` or `"isomorphic-git"` (GitHub API or direct Git manipulations)  
- `"idb-keyval"` or similar for local storage via IndexedDB  
- `"tailwindcss"` (if you’re using Tailwind)  

**Interface**  
- *N/A* – This file doesn’t export functions; it’s for build/config only.

---

## `vite.config.js`
**Purpose**  
- Configures Vite and any plugins (like Svelte plugin, PWA plugin, etc.).  
- Sets up aliases, environment variables, dev server options.

**Key Dependencies**  
- `@sveltejs/vite-plugin-svelte` (or the SvelteKit plugin if using SvelteKit)  
- Potentially `vite-plugin-pwa` if making the app a Progressive Web App.

**Interface**  
- *N/A* – It’s a configuration file, not a code library.

---

## `public/` (Directory)
**Purpose**  
- Contains static files served as-is, including:  
  - `favicon.ico`, `manifest.json` (for PWA), logos, or other assets.  
  - A `service-worker.js` if you’re managing your own SW instead of auto-generated from a plugin.

**Key Dependencies**  
- *N/A* – These are static assets.

**Interface**  
- *N/A* – No JS exports; everything is public.

---

# **2. `src/` Folder**

## `main.js`
**Purpose**  
- The primary entry point to initialize the Svelte application.  
- Creates and mounts the root `App.svelte` component.

**Key Dependencies**  
- Svelte runtime imports, your global styles (optional).

**Interface**  
```js
import App from './App.svelte';
const app = new App({
  target: document.getElementById('app')
});
export default app;
```
- No functional exports—just boots the Svelte app.

---

## `App.svelte`
**Purpose**  
- Root Svelte component. Defines the overall layout, handles global events, or sets up routing (if using `svelte-routing` or manual route logic).

**Key Dependencies**  
- Svelte’s component model.  
- Could import `Navbar.svelte` or other shared UI components.  
- May import a routing solution or define manual route handling.

**Interface**  
- Exports a **Svelte component** to be instantiated in `main.js`.

---

# **3. `routes/` Folder**

*(If using SvelteKit, the routing might be file-based and look different. This example shows manual or `svelte-routing` approach.)*

## `Home.svelte`
**Purpose**  
- The landing or home page component. Could show available conversations, login prompts, or instructions.

**Key Dependencies**  
- `authStore.js` (for user login status).  
- `conversationStore.js` (to list existing conversations if needed).

**Interface**  
- Exports a **Svelte component**.  
- No direct function exports; Svelte handles component lifecycle.

---

## `Conversation.svelte`
**Purpose**  
- The conversation UI: lists messages, message input, and optional call window.  
- Subscribes to `conversationStore` for real-time message data.  
- Triggers commits or local storage updates, handles ephemeral data if the user is not the “leader.”

**Key Dependencies**  
- `conversationStore.js`: loads/saves conversation data.  
- `raft.js`: to check or set the conversation “leader.” 
- `peerJsManager.js` for peer-to-peer messaging and calls. 
- Potentially `cache.js`: to ensure offline caching.

**Interface**  
- Exports a **Svelte component**.  
- Internally, calls store/service functions (e.g., `sendMessage()`, `initCall()`).  
- May emit events or respond to route parameters.

---

## `NotFound.svelte`
**Purpose**  
- Fallback “404” or “not found” page for unrecognized routes.

**Key Dependencies**  
- Minimal—just Svelte.

**Interface**  
- Exports a **Svelte component**.

---

# **4. `components/` Folder**

## `Navbar.svelte`
**Purpose**  
- Top navigation bar: can show user avatar, login/logout, or links to routes.

**Key Dependencies**  
- `authStore.js` to determine login status, user info.

**Interface**  
- Exports a **Svelte component** (the navbar).  
- Could emit events like `logout` if needed.

---

## `MessageList.svelte`
**Purpose**  
- Displays the list of messages in a conversation in a scrollable chat-like format.

**Key Dependencies**  
- Svelte store subscriptions, typically `conversationStore.js`.

**Interface**  
- Exports a **Svelte component**.  
- May accept a prop `messages` or directly read from the store.

---

## `MessageInput.svelte`
**Purpose**  
- Renders a text box (and possibly file attachment button) to send messages.

**Key Dependencies**  
- `conversationStore.js` or an injected method to handle message sending.

**Interface**  
- Exports a **Svelte component**.  
- May dispatch custom events like `on:messageSent`.

---

## `CallWindow.svelte`
**Purpose**  
- Handles video/audio streams for live calls.  
- Integrates with `peerJsManager.js` for establishing P2P connections.

**Key Dependencies**  
- `peerJsManager.js` for stream setup.  
- `conversationCommitQueue.js` if call recordings need to be committed to GitHub.

**Interface**  
- Exports a **Svelte component** that calls internal methods like `initCall()` or `endCall()`.  
- Could expose events such as `on:callEnded`.

---

# **5. `stores/` Folder**

*(Svelte’s built-in store mechanism, using `writable` or `readable`.)*

## `authStore.js`

**Purpose**  
- Manages user authentication state:  
  - Is user logged in?  
  - Stores the GitHub **Personal Access Token** (PAT).  
  - Loads and stores basic GitHub user info via `GET /user`.

**Key Dependencies**  
- Svelte’s `writable` store  
- `githubToken.js` to validate PAT

**Interface**  
```js
import { writable } from 'svelte/store';

export const authStore = writable({
  isLoggedIn: false,
  token: null,
  user: null
});

/**
 * Validate the token and update the authStore.
 */
export async function setPersonalAccessToken(token) {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`
      }
    });

    if (!response.ok) throw new Error('Invalid token');

    const user = await response.json();
    authStore.set({
      isLoggedIn: true,
      token,
      user
    });

    // Optional: persist to localStorage
    localStorage.setItem('skygit_token', token);

    return true;
  } catch (error) {
    logoutUser();
    return false;
  }
}

/**
 * Clears authentication state.
 */
export function logoutUser() {
  authStore.set({
    isLoggedIn: false,
    token: null,
    user: null
  });
  localStorage.removeItem('skygit_token');
}

/**
 * Loads persisted token on app start, if any.
 */
export async function tryRestoreSession() {
  const storedToken = localStorage.getItem('skygit_token');
  if (storedToken) {
    await setPersonalAccessToken(storedToken);
  }
}
```
---

## `userStore.js`
**Purpose**  
- Stores user profile details, preferences, or settings separately from auth tokens.  
- Sometimes merged with `authStore`, but can be separate for clarity.

**Key Dependencies**  
- Svelte’s `writable`.

**Interface**  
```js
export const userStore = writable({
  name: '',
  avatarUrl: '',
  // ...
});
export function updateUserProfile(profileObj) { ... }
```
- Exports a Svelte store plus update methods.

---

## `conversationStore.js`
**Purpose**  
- Tracks the **current** conversation’s data: messages, participants, etc.  
- Provides methods to load or sync the conversation file, handle ephemeral updates, finalize commits.

**Key Dependencies**  
- Svelte’s `writable` store.  
- `cache.js` for local/offline storage.  
- `conversationCommitQueue.js` for coordinating commits to GitHub.
- Possibly `githubToken.js` to push/pull conversation changes.

**Interface** 
```js
   import { writable } from 'svelte/store';
   import { broadcastMessage, sendMessageToPeer } from '../services/peerJsManager';

   export const conversationStore = writable({
     id: null,
     messages: [],
     lastCommit: null,
     leaderId: null,
     signals: [],
     // ...
   });

   export async function syncSignals(conversationId) { ... }
   export async function sendWebRTCSignal(signal) { ... }
   export async function loadConversation(id) { ... }
   export async function sendMessage(content) { ... }
   export async function syncConversation() { ... }
```

- Exports the store and various functions for message management and synchronization.

---

# **6. `services/` Folder**
Here’s the **rewritten version of the `githubAuth.js` section** (now better named `githubToken.js`) to reflect the new **Personal Access Token (PAT)** approach:

---

## `githubToken.js`

**Purpose**  
- Handles **validation and persistence** of GitHub Personal Access Tokens (PAT).  
- No OAuth redirect or code exchange needed.  
- Simple PAT-based GitHub API access.

**Key Dependencies**  
- GitHub REST API (`https://api.github.com/user`)  
-  `authStore.js` to update global auth state  
- localStorage/IndexedDB if tokens should persist between sessions

---

**Interface**  
```js
/**
 * Validates a GitHub Personal Access Token.
 * Returns the user object if valid, or null if invalid.
 */
export async function validateToken(token) {
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: { Authorization: `token ${token}` }
    });
    if (!res.ok) return null;
    return await res.json(); // returns GitHub user object
  } catch (err) {
    return null;
  }
}

/**
 * Load stored token from localStorage (if any).
 */
export function loadStoredToken() {
  return localStorage.getItem('skygit_token');
}

/**
 * Store token in localStorage.
 */
export function saveToken(token) {
  localStorage.setItem('skygit_token', token);
}

/**
 * Clear stored token from localStorage.
 */
export function clearToken() {
  localStorage.removeItem('skygit_token');
}
```



## `cache.js`
**Purpose**  
- A small utility for reading/writing data to local storage or IndexedDB.  
- Ensures offline usage or ephemeral message caching.

**Key Dependencies**  
- `idb-keyval` or the native `indexedDB` / `localStorage`.

**Interface**  
```js
export function saveConversationCache(conversationId, data) { ... }
export function loadConversationCache(conversationId) { ... }
export function clearCache(conversationId) { ... }
```
- Typically invoked by `conversationStore.js`.

---

## `githubIntegration.js` *(Optional)*
**Purpose**  
- Central place to handle **GitHub Issues/PR** references or advanced GitHub workflows.  
- E.g., fetching open issues, linking a message to a specific issue/PR, or referencing commits.

**Key Dependencies**  
- `@octokit/rest` or direct GraphQL calls.  
- Possibly `authStore.js` to get current user token.

**Interface**  
```js
export async function createIssue(repo, title, body) { ... }
export async function listIssues(repo) { ... }
export async function referencePR(repo, prNumber, message) { ... }
```
- Called by conversation logic or UI features that integrate with GitHub tickets/PRs.

---

## `externalStorage.js` *(Optional)*
**Purpose**  
- Abstracts away different **storage providers** (Git LFS, S3, Google Drive, etc.) for uploading large media (call recordings, attachments).  
- Reads `.messages/config.json` to determine which provider to use and how.

**Key Dependencies**  
- AWS SDK (if using S3), Google APIs (Drive), or Git LFS logic.  
- Possibly `authStore.js` or local config for credentials.

**Interface**  
```js
export async function uploadFile(file, conversationId) { ... }
export async function getFileLink(fileId) { ... }
```
- Called by the conversation or call-recording flow to store and retrieve large files.

---

## `conversationService.js`
**Purpose**  
- Handles conversation file creation, discovery, and management in GitHub repositories.
- Creates conversations with human-readable filenames and handles naming conflicts.
- Discovers existing conversations by scanning `.messages/` directory for `*_*.json` files.

**Key Dependencies**  
- GitHub REST API for file operations
- `githubApi.js` for username and repo operations
- UUID generation for conversation IDs

**Interface**  
```js
/**
 * Create a new conversation file in the GitHub repo.
 * Uses format: {repo_owner}_{repo_name}_{title}.json
 * Handles naming conflicts by adding numeric suffixes.
 */
export async function createConversation(token, repo, title) { ... }

/**
 * Discover all conversation files in a repo.
 * Scans .messages/ directory for files matching *_*.json pattern.
 */
export async function discoverConversations(token, repo) { ... }

/**
 * Mirror conversation to skygit-config repository.
 */
export async function commitToSkyGitConversations(token, conversation) { ... }
```

---

## `conversationCommitQueue.js`
**Purpose**  
- Manages batching and committing of conversation messages to GitHub.
- Implements debounced commits (default 5 minutes) and immediate commits on browser unload.
- Handles the leader-based commit system where only one peer commits per conversation.

**Key Dependencies**  
- `conversationStore.js` for message data
- `repoStore.js` for repository configuration
- GitHub REST API for file updates

**Interface**  
```js
/**
 * Add a conversation to the commit queue with debounced timing.
 */
export function queueConversationForCommit(repoName, convoId) { ... }

/**
 * Immediately flush queued conversations to GitHub.
 * Creates/updates files using human-readable filenames.
 */
export async function flushConversationCommitQueue(specificKeys = null) { ... }

/**
 * Check if there are pending commits (used for browser unload warning).
 */
export function hasPendingConversationCommits() { ... }
```

---

## `encryption.js` *(Optional)*
**Purpose**  
- Handles **end-to-end encryption** routines if desired.  
- May generate or manage keys, encrypt messages before commit, decrypt on fetch.

**Key Dependencies**  
- Crypto libraries or Web Crypto API.  
- Possibly GitHub or local keystore for distributing keys among conversation members.

**Interface**  
```js
export function generateKeyPair() { ... }
export async function encryptMessage(message, publicKey) { ... }
export async function decryptMessage(cipher, privateKey) { ... }
```
- Called by `conversationStore.js` or UI components if you implement secure chat.

---

# **7. `assets/` Folder**

## `icons/` (Directory)
**Purpose**  
- Stores image or SVG icons (e.g., camera.svg, microphone.png, GitHub icons).  
- Imported by `.svelte` components or CSS.

**Interface**  
- *N/A* – Static files.

---

# **8. `styles/` Folder**

## `global.css`
**Purpose**  
- Holds global styles, resets, or Tailwind directives if you’re using Tailwind.  
- Imported once, typically in `main.js` or `App.svelte`.

**Interface**  
- *N/A* – CSS loaded at runtime, not a JS module.
