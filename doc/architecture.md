# SkyGit: Architecture Overview

## 1. Project Definition & Requirements

### Core Objective
- Build a messaging application (text, audio, video) with conversations stored in a Git repository (GitHub).

### Key Requirements
- **No dedicated server**: All conversation data committed to a GitHub repository.
- **Multi-platform**: Initially Web, potential desktop/mobile wrappers.
- **Audio/Video Call Support**: Real-time (WebRTC), recordings stored in Git or external storage.
- **Integrations**: Primarily GitHub, extensible to GitLab, Bitbucket.
- **Integration with GitHub issues/PR**: Dev-friendly referencing.

### Constraints & Considerations
- **Network usage**: Optimized commit frequency, Git LFS or external storage.
- **Permissions**: Repo permissions control access.
- **Scalability**: File-splitting if large.
- **Simplicity**: Abstract Git complexities in UI.
- **Possible Encryption**: Evaluate GitHub-assisted E2E encryption.

### Value Proposition
- Version-controlled chat for dev teams.
- No reliance on traditional conversation servers.
- Enhanced collaboration with Git integrations.

## 2. High-Level Architecture

### Client-Focused SPA
- Built with **Svelte + Vite**.
- Authentication via **GitHub OAuth**, API interactions.
- Retrieves conversations from the user's personal GitHub repo (`skygit-config`).

### Repository as Backend
- Conversations stored in `.messages/` (JSON/Markdown).
- Config (`.messages/config.json`) specifies storage options for media.
- Media recordings via Git LFS or external storage providers.

### P2P Communications (WebRTC)
- Real-time audio/video and ephemeral messaging using WebRTC.
- Public/free STUN/TURN servers, no dedicated signaling server.
- Signaling handled via GitHub Discussions, leveraging slow polling (1-min intervals) and fast polling (5-second intervals) for establishing WebRTC connections.

### Raft-Like Single Committer
- Leader elected among participants for periodic commits.
- Participants store messages locally; leader merges and commits.

### Deployment
- Web App deployed as static files on GitHub Pages.
- Potential desktop/mobile wrappers (Electron/Tauri, React Native/Flutter).

## 3. Data Storage & Synchronization

### Conversation Data Format
- Single file per conversation in `.messages/`, stored as JSON or line-based format.

### Local Caching
- LocalStorage or IndexedDB for offline access.
- PWA enabled via Vite plugin.

### Commit & Sync Mechanism
- Raft-like elected leader commits periodically.
- Ephemeral updates sent via WebRTC to leader.
- Leader merges updates and pushes to GitHub.
- Clients synchronize updates upon reconnect.

### Media Storage
- Small files in Git LFS, large files via external storage.

### Security & Access
- GitHub repo permissions.
- Optional local encryption of conversation data.

## 4. Detailed Feature Breakdown

### User Authentication
- GitHub OAuth flow.
- Optional Personal Access Token (PAT).

### Conversation Management
- List, create, view, send messages, edit/delete.
- Fetches details from associated GitHub repos.

### Audio/Video Calls
- Real-time via WebRTC.
- Recording managed by leader and stored externally.

### Configuration
- `.messages/config.json` defines storage, commit frequency, encryption settings.

### UI Features
- Navbar, conversation list/view, settings.

## 5. Technical Stack & File Structure

### Frontend
- Svelte + Vite, TailwindCSS.
- Svelte Stores for state management.

### File Organization
- Organized into structured directories (`main.js`, routes, components, stores, services).
- Git operations through GitHub API.

### WebRTC
- Managed with libraries such as `simple-peer`.

## 6. Implementation Plan

### Prototype
- Basic conversation handling, GitHub OAuth, local caching.

### Raft-Like Leadership
- Leader election and commit scheduling.

### WebRTC Integration
- Real-time audio/video calls and media recording/storage.

### Multi-Conversation & UI Polish
- Expanded conversation management and enhanced UI.

### Desktop & Mobile Wrappers
- Electron/Tauri integration and secure token storage.

### Encryption & Advanced Integrations
- Exploration of E2E encryption, advanced GitHub integrations, and potential AI-driven enhancements.

