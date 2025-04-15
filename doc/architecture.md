# SkyGit: Architecture Overview

## 1. Project Definition & Requirements

### Core Objective
- Build a messaging application (text, audio, video) where all conversation data is version-controlled and stored in a GitHub repository.

### Key Requirements
- **No dedicated server**: All data persists via GitHub repositories.
- **Cross-platform support**: Starts as a web app; wrappers possible later.
- **Real-time Communication**: WebRTC for audio/video/data channels.
- **GitHub Integration**: Issues, PR references, repo-hosted media.
- **Self-sovereign Access**: Users authenticate via GitHub PATs.

### Constraints & Considerations
- **Efficient network use**: Commit batching; Git LFS or external file storage.
- **Access Control**: Managed through GitHub repo permissions.
- **File/Repo Scalability**: Design supports file-splitting and modular data layouts.
- **User Simplicity**: No Git expertise required.
- **Optional End-to-End Encryption**: Local encryption/decryption when enabled.

### Value Proposition
- Version-controlled messaging for dev teams and communities.
- No reliance on centralized infrastructure.
- Tight GitHub integration for collaborative workflows.

---

## 2. High-Level Architecture

### Client-Side SPA (No Backend Server)
- **Built with:** Svelte + Vite.
- **Authentication:** GitHub PAT entered manually, validated via GitHub API.
- **App Boot:** SPA loads and prompts for PAT; token drives all further interactions.

### GitHub as the Backend
- **Data Storage:** Conversations live in `.messages/` of user’s repo (`skygit-config`).
- **Metadata:** Stored in `config.json`, including media backend, encryption, commit policy.
- **Media:** Small media via Git LFS; large files via S3 or other cloud storage (optional).

### Repo-Wide Peer Mesh
- Each SkyGit client maintains a persistent WebRTC data channel with every online peer in the same GitHub repo.
- All real-time communication (chat, presence, signaling for calls) flows over these channels.
- GitHub Discussions or a `.messages/presence.json` file is used only for initial peer discovery and connection bootstrapping.

### Presence and Peer Discovery
- Presence is tracked by posting periodic heartbeats to a single repo-wide channel (Discussion or file).
- Each client polls this channel to discover online peers and their signaling info for connection setup.

### Call Signaling
- When a user wants to start a call, signaling (SDP/ICE) is sent over the already-established data channel.
- If the data channel is not yet established, fallback to the presence channel for initial signaling only.

### Advantages
- Reduces GitHub API usage and latency.
- Enables real-time, low-latency messaging and instant call setup.

### Raft-Like Leadership Model
- Participants elect a **single leader** for committing data.
- **Leader responsibilities:**
  - Aggregate ephemeral messages.
  - Periodically commit new messages to GitHub (every 10 minutes).
  - Immediately flush pending conversation commits when closing their browser or disconnecting.
  - On becoming leader, flush and merge any local pending conversation queue with what has already been committed.
- Non-leaders:
  - Maintain local state.
  - Transmit via WebRTC to the leader.

### Deployment & Hosting
- App hosted as static site (e.g., GitHub Pages or Netlify).
- Wrappable as Electron/Tauri/Capacitor app for desktop/mobile offline use.

---

## 3. Data Storage & Synchronization

### Format & Layout
- Each conversation stored as a single `.json` or `.md` file under `.messages/`.

### Local Caching
- Uses `IndexedDB` or `LocalStorage` for offline read/write.
- Conversations remain available even without internet.

### Commit & Sync Logic
- Raft-like leader commits:
  - Batches ephemeral messages.
  - Pushes to GitHub via REST API using the stored PAT.
  - Flushes all pending conversation commits every 10 minutes, on browser unload, and immediately upon new leader election (merging local queue with committed state).
- Sync:
  - Clients periodically check GitHub for updated conversation state.
  - Ephemeral messages reconciled with committed data.

### Media Handling
- Upload managed by the leader.
- Small media pushed via Git LFS.
- Large recordings optionally pushed to S3/Drive/etc., with links in `.messages/config.json`.

### Security & Access
- Access managed via GitHub repo permissions.
- Optional encryption layer applied locally.

---

## 4. Feature Breakdown

### Authentication
- **No OAuth flow.**
- Users **paste their GitHub PAT** into the app on first load.
- Token is stored locally and used for:
  - GitHub API calls (read/write)
  - User identity and repo access validation

### Conversation Management
- List and open `.messages/` files in the GitHub repo.
- Real-time edits via ephemeral messages (WebRTC).
- Persistent history via Raft commit logic.

### Real-Time Calls
- WebRTC handles:
  - Video
  - Audio
  - Ephemeral messaging
- No backend; signaling via GitHub Discussions.

### Configuration Support
- `.messages/config.json` controls:
  - Encryption toggle
  - Commit frequency
  - Media storage location
  - Participant access (if extended beyond GitHub ACL)

### UI/UX Elements
- **Routing:** `Home.svelte`, `Conversation.svelte`, `NotFound.svelte`
- **Components:** `Navbar.svelte`, `MessageList.svelte`, `MessageInput.svelte`, `CallWindow.svelte`
- **Stores:** Svelte stores manage auth, user, conversation, cache

---

## 5. Technical Stack & File Structure

### Frontend Tech
- **Framework:** Svelte
- **Build Tool:** Vite
- **Styling:** TailwindCSS (optional)
- **State:** Svelte writable stores

### Directory Structure
As documented in `file_structure.md`:
- `src/stores/authStore.js`: handles PAT storage, validation
- `src/services/githubAuth.js`: contains `isTokenValid()` and token utilities
- `src/services/githubSignaling.js`: GitHub Discussions for signaling
- `src/services/raft.js`: manages leader election and commit scheduling
- `src/services/webrtc.js`: WebRTC connection + data/media channels

### Dependencies
- `@octokit/rest`: GitHub API
- `simple-peer`: WebRTC abstraction
- `idb-keyval`: IndexedDB access
- `vite-plugin-pwa` (optional)

---

## 6. Implementation Plan

### MVP (Minimal Viable Product)
- Conversation fetch/commit using PAT
- Basic WebRTC chat
- Local caching
- Basic UI

### Raft Leadership + Commit Flow
- Message batching
- Leader election
- Commit propagation to GitHub

### Audio/Video Support
- Calls with live WebRTC stream
- Optional recording + upload

### Enhanced UX + Multi-Device
- Conversation filters
- PWA support
- Notifications

### Wrappers + Offline Mode
- Tauri/Electron/Capacitor builds
- Secure PAT storage (Keychain, keystore)

### Encryption & Advanced Features
- Optional local encryption of messages
- GitHub issue/PR smart linking
- Markdown message support
