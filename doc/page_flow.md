## SkyGit: Application User Flow Overview

### **1. User Launches the App**
- User navigates to the SkyGit app URL (hosted via GitHub Pages or other static hosting).
- The Svelte SPA loads and initializes (`main.js` -> `App.svelte`).
- UI displays a basic landing screen or immediate prompt to authenticate.

---

### **2. Authentication via GitHub OAuth**
- User clicks **"Login with GitHub"**.
- `githubAuth.js` initiates the OAuth flow:
  - Redirects user to GitHub’s OAuth page.
  - User authorizes the application.
- User returns to the SkyGit app with an OAuth code.
- SkyGit exchanges OAuth code for an access token:
  - Token stored securely (memory, IndexedDB, or local storage via `authStore.js`).
- User is now authenticated; basic GitHub user info is fetched and stored in `userStore.js`.

---

### **3. Fetching the Conversation List**
- The app calls GitHub REST API to retrieve the contents of the user's personal repository (`skygit-config`):
  ```bash
  GET /repos/{user}/skygit-config/contents/.messages
  ```
- Retrieves metadata for each conversation (title, last update, repo URL).
- App UI lists available conversations, displayed via `Home.svelte`.

---

### **4. User Selects a Conversation**
- Clicking a conversation triggers loading conversation details:
  - App fetches conversation data from `.messages/<conversation>.json` in the relevant GitHub repo.
  - Data is cached locally (`cache.js`) for offline access.
  - Messages appear in UI (`Conversation.svelte`, `MessageList.svelte`).

---

### **5. Joining Conversation & Presence Signaling**
- User entering a conversation posts "presence" information to GitHub Discussions via `githubSignaling.js`:
  ```json
  { "type": "presence", "user": "<user_id>", "timestamp": "<current_timestamp>" }
  ```
- Periodic slow polling (once per minute) checks GitHub Discussions for presence/activity by other users.

---

### **6. Establishing WebRTC Sessions**
- When the user initiates or joins a call, signaling occurs via GitHub Discussions (`githubSignaling.js`):
  - A user starting a call posts a WebRTC offer.
  - Other participants detect this via fast polling (every 5 seconds) and respond with answers and ICE candidates.
  - WebRTC connections established using signaling data (`webrtc.js` and `githubSignaling.js`).
  - Live audio/video streams are displayed in the `CallWindow.svelte`.

---

### **7. Sending Text Messages (Ephemeral Storage)**
- User types a message (`MessageInput.svelte`) and submits:
  - Message is immediately sent via WebRTC data channels (`webrtc.js`) to the current elected conversation leader.
  - Leader stores message locally for eventual commit; all participants update UI immediately for real-time feedback.

---

### **8. Periodic Commit (Raft-Like Logic)**
- A single participant is elected as the "leader" using Raft-like logic (`raft.js`).
- Leader aggregates ephemeral messages and periodically commits conversation updates to GitHub:
  - By default, commits might happen daily, but can also be manually triggered.
  - Updates the `.messages/<conversation>.json` file via GitHub API.

---

### **9. Receiving Committed Updates**
- All clients periodically synchronize conversation state by pulling updated conversation files from GitHub:
  - Updates merge with local cached data.
  - Ensures all participants eventually reach consistent conversation state.

---

### **10. Handling Media (Audio/Video Recording)**
- If calls are recorded:
  - Leader participant handles recording (e.g., via browser APIs).
  - Recordings uploaded to Git LFS or external storage (as configured in `.messages/config.json`).
  - References to recorded media are included in the conversation commit.

---

### **11. Offline/Online Experience**
- When offline:
  - Users can continue reading previously cached conversations.
  - Users can queue messages locally; these messages sync when connectivity resumes.
- When back online:
  - Cached and ephemeral messages are merged and synchronized via leader commits.

---

### **12. Integrations with GitHub Issues and PRs**
- Users can reference GitHub Issues or PRs within messages:
  - SkyGit parses references and links directly to GitHub issues/PRs (`githubIntegration.js`).
  - This feature enhances dev-team workflows by directly connecting conversations to development tasks.

---

### **13. Optional Security Enhancements (Encryption)**
- If enabled via `.messages/config.json`:
  - Messages are encrypted locally before committing (`encryption.js`).
  - Participants decrypt messages upon fetching updated conversation files.

---

### **14. Logging Out**
- User can log out anytime:
  - Auth tokens cleared from local storage (`authStore.js`).
  - UI reverts to login screen.

---

### **User Flow Summary**
| Step | Action                      | Module / Service                     |
|------|-----------------------------|--------------------------------------|
| 1    | Open App                    | `App.svelte`, `main.js`              |
| 2    | Authenticate                | `githubAuth.js`, `authStore.js`      |
| 3    | List Conversations          | GitHub API, `Home.svelte`            |
| 4    | Open Conversation           | `conversationStore.js`, `cache.js`   |
| 5    | Presence Signaling          | `githubSignaling.js`                 |
| 6    | WebRTC Signaling & Calls    | `githubSignaling.js`, `webrtc.js`    |
| 7    | Send Ephemeral Messages     | `webrtc.js`, `conversationStore.js`  |
| 8    | Periodic Commit (Leader)    | `raft.js`, GitHub API                |
| 9    | Receive Updates             | GitHub API, `conversationStore.js`   |
| 10   | Media Handling              | `externalStorage.js` (optional)      |
| 11   | Offline Handling            | `cache.js`, LocalStorage/IndexedDB   |
| 12   | GitHub Integration          | `githubIntegration.js` (optional)    |
| 13   | Encryption                  | `encryption.js` (optional)           |
| 14   | Logout                      | `authStore.js`                       |
