
## SkyGit: Application User Flow Overview

### **1. User Launches the App**
- User navigates to the SkyGit app URL (hosted via GitHub Pages or other static hosting).
- The Svelte SPA loads and initializes (`main.js` → `App.svelte`).
- UI prompts the user to paste a **GitHub Personal Access Token (PAT)**.

---

### **2. Authentication via Personal Access Token**
- User pastes a **GitHub PAT** into the app.
- The token is validated using a lightweight API request (e.g., `GET /user`).
- If valid:
  - The token is securely stored (in memory, IndexedDB, or localStorage via `authStore.js`).
  - Basic GitHub user info is fetched and stored in `userStore.js`.

---

### **3. Fetching the Conversation List**
- App uses the PAT to access the user’s personal GitHub repository `skygit-config`.
  ```bash
  GET /repos/{user}/skygit-config/contents/.messages
  ```
- Retrieves conversation files with human-readable names: `{repo_owner}_{repo_name}_{title}.json`
- UI displays the list via `Home.svelte`.

---

### **4. User Selects a Conversation**
- User clicks a conversation entry.
- App fetches:
  - The `.messages/<conversation>.json` file from GitHub.
  - Recent signaling data from GitHub Discussions.
- Data is cached locally (`cache.js`) for offline use.
- Messages are rendered in `Conversation.svelte`.

---

### **5. Joining Conversation & Presence Signaling**
- When entering a conversation, the app posts a presence signal:
  ```json
  { "type": "presence", "user": "<user_id>", "timestamp": "<now>" }
  ```
  via GitHub Discussions (`githubSignaling.js`).
- A **fast poll** (~5 seconds) checks the presence channel to discover online peers and their join order (`join_timestamp`).

---

### **6. Establishing WebRTC Sessions**
- Once presence is known, each client determines the **leader** (earliest joiner).
  - **Leader** opens WebRTC data channels to all other online peers.
  - **Non-leader** opens a single data channel to the leader.
  - SDP offers/answers and ICE candidates are exchanged over those channels.
  - Media streams and data messages flow over the established data channels.

---

### **7. Sending Text Messages (Ephemeral Storage)**
- User sends a message via `MessageInput.svelte`.
- **Non-leaders** forward messages over their single channel to the leader; **leader** then rebroadcasts to other peers.
- UI updates instantly for all participants.

---

### **8. Periodic Commit (Raft-Like Logic)**
- A leader is determined by the earliest `join_timestamp` in the presence channel (first joiner).  On leader departure, leadership passes to the next oldest joiner.
- Leader commits aggregated messages to GitHub:
  - `.messages/<conversation>.json` is updated.
  - Can be triggered automatically or manually.

---

### **9. Receiving Committed Updates**
- Clients pull updated conversation files periodically.
- Updates are merged with local state to ensure consistency.

---

### **10. Handling Media (Audio/Video Recording)**
- If recording is enabled:
  - The leader records the call.
  - File is uploaded to GitHub LFS or an external service.
  - The commit includes metadata pointing to the media file.

---

### **11. Offline/Online Experience**
- Offline:
  - Cached conversations remain accessible.
  - Messages are queued for later sync.
- Online:
  - Queued messages are sent and committed.
  - Data is synchronized with the latest GitHub content.

---

### **12. Integrations with GitHub Issues and PRs**
- Messages can reference GitHub Issues/PRs.
- SkyGit parses and links them via `githubIntegration.js`.

---

### **13. Optional Security Enhancements (Encryption)**
- If enabled in `.messages/config.json`:
  - Messages are encrypted before commit (`encryption.js`).
  - Decryption occurs client-side upon fetch.

---

### **14. Logging Out**
- User can clear the session:
  - PAT is wiped from storage (`authStore.js`).
  - App resets to token input prompt.

---

### **User Flow Summary**

| Step | Action                      | Module / Service                     |
|------|-----------------------------|--------------------------------------|
| 1    | Open App                    | `App.svelte`, `main.js`              |
| 2    | Authenticate via PAT        | `authStore.js`, `userStore.js`       |
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

