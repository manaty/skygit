Here’s a **detailed step-by-step development plan** for building the **first working version of SkyGit**, along with **testing instructions** for each step:

---

## ✅ **PHASE 1: Project Bootstrapping**

### 1. **Initialize Project**
- **Task**: Set up `skygit/` project with Svelte + Vite + Tailwind.
- **Test**: Run `npm run dev` and verify that the default Svelte landing page loads without errors.

---
Here’s the updated **PHASE 2** of the SkyGit project plan to reflect your decision to use **Personal Access Tokens (PATs)** instead of GitHub OAuth:

---

## ✅ **PHASE 2: Authentication & Repo Setup (via PAT)**

### 2. **Authenticate with GitHub Personal Access Token**

- **Task**: Replace OAuth with a manual token-based authentication flow using GitHub PATs.
  - Create `LoginWithPAT.svelte` component to prompt user for PAT input.
  - In `githubToken.js`, implement:
    - `validateToken(token)`: calls `GET /user` to confirm validity.
    - `saveToken(token)` / `clearToken()` / `loadStoredToken()` using `localStorage`.
  - In `authStore.js`, update store with `{ isLoggedIn, token, user }` structure.

- **Test**:
  - Launch app and paste a valid PAT.
  - Confirm GitHub username and avatar are displayed in UI (`userStore.js`).
  - Refresh browser → verify session persists via stored token.
  - Paste an invalid PAT → verify error is shown and login rejected.

---

### 3. **Check or Create `skygit-config` Repository**

- **Task**: After token validation, ensure the user's GitHub account has a `skygit-config` repo:
  - In `githubToken.js` or `githubApi.js`, implement:
    - `ensureSkyGitRepo(token)`:
      - `GET /repos/:username/skygit-config`
      - If 404 → `POST /user/repos` with `{ name: 'skygit-config', private: true }`

- **Test**:
  - Login with a fresh GitHub account.
  - Confirm that `skygit-config` repo is created automatically.
  - Login again with existing token → verify no duplicate repo creation.
  - Check on GitHub that the repo is private and has a `.messages/` folder created later.

---

### ✅ Files & Components Involved

| File                          | Role                                                       |
|-------------------------------|------------------------------------------------------------|
| `LoginWithPAT.svelte`         | UI to enter and validate the token                         |
| `authStore.js`                | Stores `token`, `isLoggedIn`, and `user`                   |
| `userStore.js`                | Stores user info (optional, or merged into `authStore`)    |
| `githubToken.js`              | Validates and persists token                               |
| `githubApi.js`                | Checks or creates `skygit-config` repo                     |
| `Navbar.svelte`               | Shows login status and user avatar                         |

---

### ✅ User Flow Recap

1. User opens the app (e.g., on GitHub Pages).
2. Prompted to enter a GitHub PAT.
3. Token is validated → user profile is fetched and displayed.
4. App checks if `skygit-config` exists → creates it if not.
5. User proceeds to load or create conversations.

---

## ✅ **PHASE 3: Load and Display Conversations**

### 4. **Fetch List of Conversations**
- **Task**: In `conversationStore.js`, call GitHub API to list `.messages/*.json` files.
- **Test**:
  - Confirm list is rendered in `Home.svelte`.
  - Add dummy file via GitHub and confirm it shows up after refresh.

### 5. **Load Conversation Details**
- **Task**: Load content of selected conversation `.json` file and store in `conversationStore.js`.
- **Test**:
  - Click a conversation.
  - Verify messages display via `MessageList.svelte`.

---

## ✅ **PHASE 4: Presence and Signaling**

### 6. **Post Presence**
- **Task**: In `peerJsManager.js`, maintain peer presence via GitHub repository files.
- **Test**:
  - Enter a conversation.
  - Confirm presence is posted.
  - View discussion manually to verify comment content.

### 7. **Implement Slow Polling**
- **Task**: Poll discussion every 60s for presence data.
- **Test**:
  - Open conversation in 2 tabs.
  - Ensure both see each other as online after 1 min.

---

## ✅ **PHASE 5: WebRTC Setup**

### 8. **Add Call Button and WebRTC Initiation**
- **Task**: Add call button to `Conversation.svelte`. On click, initiate call via `peerJsManager.js`.
- **Test**:
  - User A initiates a call.
  - Confirm offer is posted to discussion.

### 9. **Fast Polling for Handshake**
- **Task**: On detecting an offer, start 5s poll for answers and ICE candidates.
- **Test**:
  - User B sees offer, responds.
  - Ensure connection is established via `webrtc.js`.

### 10. **Render Call Window**
- **Task**: Show local and remote streams in `CallWindow.svelte`.
- **Test**:
  - Confirm live audio/video is visible to both parties.
  - Confirm fallback to slow poll on timeout.

---

## ✅ **PHASE 6: Messaging & Leader Election**

### 11. **Send Ephemeral Messages via WebRTC**
- **Task**: Use data channels in `webrtc.js` to send messages to leader.
- **Test**:
  - Send message via `MessageInput.svelte`.
  - Confirm leader receives and displays it immediately.

### 12. **Implement Raft Leader Election**
- **Task**: Use `peerJsManager.js` to coordinate message commits among peers.
- **Test**:
  - Simulate multiple users.
  - Check only one becomes leader and schedules commits.

### 13. **Leader Commits Messages to GitHub**
- **Task**: Leader periodically pushes updated `.messages/*.json` to GitHub.
- **Test**:
  - Wait for commit.
  - Refresh another tab and confirm new messages are pulled and displayed.

---

## ✅ **PHASE 7: Sync and Offline Caching**

### 14. **Sync on Reconnect**
- **Task**: On reconnect, pull latest messages and merge with cache.
- **Test**:
  - Disconnect one client, send messages from another.
  - Reconnect and confirm sync.

### 15. **Offline Reading & Queued Messages**
- **Task**: Use `cache.js` with IndexedDB or LocalStorage.
- **Test**:
  - Open app offline.
  - View cached conversations.
  - Queue message, reconnect, and ensure it sends.

---

## ✅ **PHASE 8: UI Polish and Testing**

### 16. **Refine Conversation UI**
- **Task**: Polish `MessageList`, `MessageInput`, and `Navbar` components.
- **Test**:
  - Visual inspection.
  - Confirm responsive behavior on mobile and desktop.

### 17. **Handle Errors and Edge Cases**
- **Task**: Add error handling in API calls and signaling.
- **Test**:
  - Simulate GitHub rate limiting, bad OAuth token, dropped connection.

---

## ✅ **BONUS: Optional Enhancements**

### 18. **Basic Encryption**
- **Task**: Use `encryption.js` to locally encrypt/decrypt messages.
- **Test**:
  - Enable encryption in `.messages/config.json`.
  - Verify encrypted commit content and decrypted UI display.

### 19. **Media Recording**
- **Task**: Leader records WebRTC call; uploads to GitHub or external storage.
- **Test**:
  - Record a short call.
  - Confirm file appears in repo or storage, and linked in message log.

---

## ✅ **DEPLOYMENT**

### 20. **Deploy on GitHub Pages**
- **Task**: Add deploy script in `package.json`, use `vite` output.
- **Test**:
  - Build and push to `gh-pages`.
  - Visit app URL and test end-to-end flow.

