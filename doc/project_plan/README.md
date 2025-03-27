Here’s a **detailed step-by-step development plan** for building the **first working version of SkyGit**, along with **testing instructions** for each step:

---

## ✅ **PHASE 1: Project Bootstrapping**

### 1. **Initialize Project**
- **Task**: Set up `skygit/` project with Svelte + Vite + Tailwind.
- **Test**: Run `npm run dev` and verify that the default Svelte landing page loads without errors.

---

## ✅ **PHASE 2: Authentication & Repo Setup**

### 2. **Implement GitHub OAuth**
- **Task**: In `githubAuth.js`, implement login with GitHub and token storage in `authStore.js`.
- **Test**:
  - Click “Login with GitHub”.
  - Complete OAuth.
  - Confirm token is stored and user info appears in UI (`userStore.js`).

### 3. **Check/Create `skygit-config` Repo**
- **Task**: Use the GitHub API to verify existence or create the `skygit-config` repo.
- **Test**:
  - Log in with a new account.
  - Confirm that the repo is created automatically or acknowledged as existing.

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
- **Task**: In `githubSignaling.js`, post a presence JSON to GitHub Discussions.
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
- **Task**: Add call button to `Conversation.svelte`. On click, post WebRTC offer via `githubSignaling.js`.
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
- **Task**: Use `raft.js` to elect a leader per conversation.
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

