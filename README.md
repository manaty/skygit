# **SkyGit: Architecture Overview**

## 1. **Project Definition & Requirements**

1. **Core Objective**  
   - Build a messaging application (text, audio, video) with conversations stored in a Git repository (GitHub).  

2. **Key Requirements**  
   - **No dedicated server**: All conversation data is committed to a GitHub repository.  
   - **Multi-platform**: Web (initially), with potential for desktop/mobile wrappers.  
   - **Audio/Video Call Support**: Real-time calls (WebRTC), recorded files stored in Git or external storage (via config).  
   - **Integrations**: GitHub primary; can extend to GitLab, Bitbucket in the future.  
   - **Integration with GitHub issues/PR**: Provide dev-friendly features such as referencing issues, PRs, or AI agents.  

3. **Constraints & Considerations**  
   - **Network usage**: Optimize commit frequency, large file handling with Git LFS or external providers.  
   - **Permissions**: Repo permissions on GitHub control conversation access.  
   - **Scalability**: Investigate splitting conversation files if they grow large.  
   - **Simplicity**: Focus on a dev-friendly UI that abstracts Git complexities.  
   - **Possible Encryption**: Evaluate if GitHub can provide or assist with key distribution for E2E encryption.  

4. **Value Proposition**  
   - A real-time, version-controlled chat environment for dev teams working closely with Git.  
   - Eliminates reliance on traditional servers for storing conversation history.  
   - Enhances collaboration by integrating with issues, PRs, and potential AI agents.

---

## 2. **High-Level Architecture**

1. **Client-Focused SPA**  
   - Built with **Svelte** + **Vite** as a Single-Page Application (SPA).  
   - Uses **GitHub OAuth** for authentication; direct calls to GitHub REST/GraphQL APIs for reading/writing conversation data.  

2. **Repository as the “Backend”**  
   - **Conversations** (text messages) in `.messages/` directory as JSON or Markdown.  
   - **Config** (`.messages/config.json`) specifying storage methods for larger media (LFS, GDrive, S3, etc.).  
   - **Recordings** stored either in Git LFS or external cloud, with references in `.messages/` conversation files.

3. **P2P Communications (WebRTC)**  
   - Real-time audio/video and data channels for ephemeral chat messages.  
   - **No dedicated signaling server** included by default—public/free STUN/TURN services used (or user-provided credentials).  

4. **Raft-Like Single Committer**  
   - Among conversation participants, one “leader” is **elected** to handle actual commits to Git at a set interval (daily by default).  
   - All other participants store their messages locally (and possibly in ephemeral data channels) until the leader commits.  

5. **Deployment**  
   - **Web App**: Deployed as static files on GitHub Pages (or another static hosting).  
   - Potential future packaging for **desktop** (Electron/Tauri) or **mobile** (React Native/Flutter wrappers).  

---

## 3. **Data Storage & Synchronization**

1. **Conversation Data Format**  
   - Each conversation has one file in `.messages/`.  
   - **Messages** appended in JSON or line-based format for easy merges.  

2. **Local Caching**  
   - The app uses **localStorage** or **IndexedDB** (via small wrappers like `cache.js`) to maintain an **offline-ready** cache of messages.  
   - **PWA** support via Vite’s PWA plugin allows basic offline usage.

3. **Commit & Sync Mechanism**  
   - **Raft-like logic**: The elected leader commits conversation updates at intervals or on demand.  
   - Other users push ephemeral updates to the leader’s client via WebRTC data channels.  
   - Leader merges these ephemeral updates into the conversation file and commits/pushes to GitHub.  
   - On next reconnect or user action, clients pull the updated conversation file.

4. **Media Storage**  
   - For small files, store in Git LFS directly.  
   - For large recordings, use external providers (Google Drive, S3, etc.) as defined in `.messages/config.json`.

5. **Security & Access**  
   - Governed by GitHub repo permissions.  
   - Potential to implement local encryption of messages before commit, if needed (key management under exploration).

---

## 4. **Detailed Feature Breakdown**

1. **User Authentication**  
   - GitHub OAuth flow; user tokens stored locally (in memory, or secure store in desktop/mobile).  
   - For advanced usage, a **Personal Access Token (PAT)** can be set for CLI or offline commits.  

2. **Conversation Management**  
   - **List** all `.messages/*.json` or `.md` files as conversation references.  
   - **Create** a conversation file with optional initial metadata.  
   - **View** a conversation: load from local cache, then pull the latest from GitHub to merge.  
   - **Send Message**: broadcast through WebRTC data channel to the leader; leader eventually commits.  
   - **Edit/Delete**: flagged in ephemeral messages; final commit reflects the update/deletion.

3. **Audio/Video Calls**  
   - **Real-time**: peer-to-peer or multi-party with WebRTC mesh; free STUN/TURN servers.  
   - **Recording**: performed locally by the current leader, who uploads the file to LFS or external storage, then references it in `.messages/<conversation>.json`.

4. **Configuration**  
   - `.messages/config.json` for:  
     - **Storage options**: (Git LFS, GDrive, S3, etc.)  
     - **Commit frequency**: (default once per day)  
     - **Encryption**: optional flags or keys if E2E is implemented.

5. **UI Features** (Svelte Components)  
   - **Navbar** for login status, user info.  
   - **Conversation List** with previews.  
   - **Conversation View**: message list, input box, call window.  
   - **Settings** for user tokens, sync intervals, media storage preferences.

---

## 5. **Technical Stack Choices & File Structure**

1. **Frontend**  
   - **Svelte + Vite**: Minimizes boilerplate, fast hot reload, easy PWA setup.  
   - **Stores**: Svelte’s built-in store system for conversation data (`conversationStore.js`), authentication (`authStore.js`), and user profiles (`userStore.js`).  
   - **UI**: TailwindCSS for rapid styling.  

2. **File/Module Organization** (Example)
   - **`src/`**  
     - **`main.js`**: App entry, Svelte app initialization.  
     - **`App.svelte`**: Root layout & routing.  
     - **`routes/`**: Svelte components for each route (Home, Conversation, 404, etc.).  
     - **`components/`**: Shared UI components (Navbar, MessageList, CallWindow, etc.).  
     - **`stores/`**: Svelte stores for managing auth, conversation data, user info.  
     - **`services/`**:  
       - **`githubAuth.js`**: Handles OAuth logic & token exchange.  
       - **`webrtc.js`**: Sets up WebRTC calls (with `simple-peer` or similar).  
       - **`raft.js`**: Leader election & commit scheduling.  
       - **`cache.js`**: Local cache layer (IndexedDB/localStorage).  
     - **`styles/`**: Global CSS or Tailwind base.  

3. **Git Operations**  
   - Use GitHub REST or GraphQL API calls (via fetch or libraries like `@octokit/rest`) to push/pull conversation files.  
   - Desktop wrappers might incorporate a local `git` CLI if needed for offline merges.

4. **WebRTC**  
   - Typically done via a small library like `simple-peer` to manage signaling overhead.  
   - Users connect peer-to-peer and send ephemeral chat messages to the conversation’s leader for commit.

---

## 6. **Implementation Plan (Updated)**

1. **Prototype (Svelte + Vite)**  
   - Minimal conversation store, single conversation file, basic login with GitHub OAuth.  
   - Implement local caching (`cache.js`) so user can read messages offline.  

2. **Raft-Like Leadership**  
   - Add leader election logic in `raft.js`.  
   - Leader commits conversation changes after some interval or manual “Commit Now” action.  

3. **WebRTC Calls**  
   - Integrate real-time audio/video in `CallWindow.svelte` using `webrtc.js`.  
   - Leader also handles recording upload to LFS/external.  

4. **Multi-Conversation & UI Polish**  
   - Expand to multiple `.messages/` files for separate conversations.  
   - Build conversation list, search, previews.  

5. **Desktop & Mobile**  
   - Wrap the SPA in Electron/Tauri (desktop) or a native shell (mobile).  
   - Use secure keychain or OS-level credential store for tokens.

6. **Encryption & Advanced Integrations**  
   - Investigate generating or retrieving keys from GitHub for E2E encryption.  
   - Integrate with GitHub issues or PR references.  
   - Possibly add AI-based suggestions or summarization.

---

## 7. **Summary**

In this **amended architecture**, the **Svelte + Vite** SPA:

- Uses **local caches** for offline/ephemeral messages, then commits them to GitHub via an **elected leader**.  
- Employs **WebRTC** for real-time audio/video calls and ephemeral messaging.  
- Stores final conversation data in `.messages/` with optional **Git LFS** or external storage for large files.  
- Remains **serverless** beyond GitHub’s infrastructure, reducing operating costs and providing natural version control of chats.

This design offers a **rapidly-developed**, **modular** architecture, well-suited for a dev-focused Skype replacement tightly integrated with Git. By combining **Svelte**’s minimal boilerplate, **Vite**’s fast dev server, and **GitHub** as the “backend,” you get a highly flexible, offline-capable chat system that can adapt to future encryption or AI enhancements.