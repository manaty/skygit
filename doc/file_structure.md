from: README.md

## **Root Project Structure**

```
skygit/
├── package.json
├── vite.config.js
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   └── ... (other static files)
├── src/
│   ├── main.js
│   ├── App.svelte
│   ├── routes/
│   │   ├── Home.svelte
│   │   ├── Conversation.svelte
│   │   └── NotFound.svelte
│   ├── components/
│   │   ├── Navbar.svelte
│   │   ├── MessageList.svelte
│   │   ├── MessageInput.svelte
│   │   └── CallWindow.svelte
│   ├── stores/
│   │   ├── authStore.js
│   │   ├── userStore.js
│   │   └── conversationStore.js
│   ├── services/
│   │   ├── githubToken.js
│   │   ├── raft.js
│   │   ├── webrtc.js
│   │   ├── githubSignaling.js
│   │   ├── cache.js
│   │   ├── githubIntegration.js
│   │   ├── externalStorage.js
│   │   └── encryption.js
│   ├── assets/
│   │   └── icons/
│   └── styles/
│       └── global.css
└── ...
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
- `webrtc.js`: for initiating or handling calls.
- `raft.js`: to check or set the conversation “leader.” 
- `githubSignaling.js` for polling/signaling. 
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
- Integrates with `webrtc.js` for establishing P2P connections.

**Key Dependencies**  
- `webrtc.js` for stream setup.  
- Possibly `raft.js` if the leader is the one responsible for certain call features (recording).

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
- Provides methods to load or sync the conversation file, handle ephemeral updates, finalize commits (in tandem with `raft.js`).

**Key Dependencies**  
- Svelte’s `writable` store.  
- `cache.js` for local/offline storage.  
- `raft.js` if the store needs to confirm leader status or coordinate commit frequency.
- Possibly `githubToken.js` to push/pull conversation changes.

**Interface** 
```js
   import { writable } from 'svelte/store';
   import { fetchSignals, postSignal } from '../services/githubSignaling';

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

## `raft.js`
**Purpose**  
- Implements a **Raft-like** logic to elect a single committer (leader) among conversation participants.  
- Manages heartbeats, terms, or minimal concurrency rules for leader election.

**Key Dependencies**  
- Possibly `conversationStore.js` to track who is leader.  
- A real-time channel (via `webrtc.js` data channels) for election messages.

**Interface**  
```js
export function startElection(conversationId) { ... }
export function receiveVoteRequest(data) { ... }
export function becomeLeader(...) { ... }
export function isLeader() { ... }
export function scheduleCommits(interval) { ... }
```
- Typically invoked by `conversationStore.js` or the UI to manage commit scheduling.

---

## `webrtc.js`
**Purpose**  
- Handles audio/video WebRTC logic, plus data channels for ephemeral chat messages (if desired).  
- Abstracts away STUN/TURN servers config, signaling steps, etc.

**Key Dependencies**  
- `simple-peer` or `peerjs`.  
- Possibly a referencing store or UI (e.g., `CallWindow.svelte`).

**Interface**  
```js
import SimplePeer from 'simple-peer';

export function initCall(stream, onSignal, onStream) { ... }
export function handleRemoteSignal(signal) { ... }
export function endCall() { ... }
```
- You might expand with data channel messaging, multiple peers, or screen-sharing support.

---

## `githubSignaling.js`
**Purpose**  
- Encapsulate the logic for slow (1-min) and fast (5-sec) polling to GitHub Discussions for WebRTC signaling and presence management.c.

**Interface** Example:
   ```js
   export async function postPresence(userId, conversationId) { ... }
   export async function postSignal(conversationId, signalData) { ... }
   export async function fetchSignals(conversationId) { ... }
   ```

---
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
