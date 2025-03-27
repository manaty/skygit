# skygit
A skype replacement for dev teams working with git

## 1. **Project Definition & Requirements**

1. **Core Objective**  
   - Build a messaging application (text, audio, video) with conversations stored in a Git repository.  

2. **Key Requirements**  
   - **No dedicated server needed**: All conversation data is committed to a GitHub repository.  
   - **Multi-platform**: Web, desktop, mobile.  
   - **Audio/Video Call Support**: With recorded calls saved (via Git LFS, Google Drive, S3, etc.) as specified in a repo config file.  
   - **Integrations**: Primarily GitHub, with possible extension to GitLab, Bitbucket, etc.

3. **Constraints & Considerations**  
   - **Network usage**: Pushing/pulling to Git can be expensive if large files or many updates are involved; might require efficient commits or Git LFS usage.  
   - **Privacy & permissions**: The repository’s permission settings govern access to conversations.  
   - **Scalability**: If the user wants many messages or large files, carefully choose storage strategies (Git LFS or external cloud).  
   - **Simplicity**: Must remain user-friendly, but is addressed to developers.  

4. **Value Proposition**  
   - A secure, version-controlled communication environment where conversation history is tracked in Git.  
   - Eliminates reliance on centralized servers for real-time messaging.
   - Integrate natively with github issues, PR and AI agents

---

## 2. **High-Level Architecture**

1. **Client-Focused Application**  
   - The primary logic resides in the client.  
   - The client communicates directly with GitHub APIs (or `git` CLI under the hood for desktop) to read/write conversation data in a repo.

2. **Repo as the “Backend”**  
   - A Git repository (on GitHub) holds:  
     - **Conversations** (text messages) as structured files.  
     - **Configuration** for audio/video storage.  
     - **Recorded media** (via Git LFS or external providers as specified in a config).  

3. **Deployment**  
   - **Web App**: Deployed as a static site or minimal backend. Communicates with GitHub through OAuth or personal access tokens.  
   - **Desktop App**: Built using cross-platform frameworks (e.g., Electron, Tauri) with integrated Git operations.  
   - **Mobile App**: Built with a cross-platform SDK (e.g., Flutter, React Native) or native.  

4. **Call Functionality**  
   - Real-time calls can be peer-to-peer via WebRTC, or another real-time protocol.  
   - Once recording is finished, the resulting file is pushed to storage.  
   - The application references the recorded files in the conversation timeline (by commit ID or external link).  

---

## 3. **Data Storage & Synchronization Strategy**

1. **Data Format for Conversations**  
   Each message is appended to a single Markdown or JSON file per conversation in the '.messages' directory  

2. **Storage of Media**  
   - If under a certain size limit, store directly in Git LFS.  
   - If large, store in an external provider (Google Drive, S3, etc.) with a reference link in the conversation record.  
   **config file** in the repo (e.g., `.messages\config.json`) defines where media is stored and how to authenticate.

3. **Sync Mechanism**  
   In each conversation a lead is elected (algo similar to raft) and is in charge of committing at specific frequency (once per day by default) and storing call recordings.

4. **Security & Access Control**  
   - Access determined by repo permissions (public, private, or organization-level).  
   - End-to-end encryption to be studied : is there any id provided by github that could be shared only by repository users and used as key pair seed ?  

---

## 4. **Detailed Feature Breakdown**

1. **User Authentication**  
   - **GitHub OAuth** for the web interface.  
   - **Personal Access Tokens** for CLI or offline usage.  
   - **PAT storage** or keychain usage for desktop/mobile to avoid user re-entry.

2. **Conversation Management**  
   - **List conversations** (equivalent to listing conversation files or subfolders in the repo).  
   - **Create conversation** (generate a new file with metadata).  
   - **View conversation** (pull latest, parse the file, display messages).  
   - **Add message** (broadcast message for later commit).  
   - **Delete/edit message** (broadcast message update/deletion for later commit).

3. **Audio/Video Calls**  
   - **Real-time calls**:  
     - WebRTC for group calls.    
   - **Recording**:  
     - After the call, record is saved as an audio/video file locally by the conversation lead.  
     - The file is uploaded by the lead to Git LFS or an external provider (referenced in conversation).  

4. **Config File**  
   - A `config.json` in the `.messages\` directory of the repo containing:  
     - **Preferred storage**: GitHub LFS, Google Drive, S3…  
     - **Limits** (size thresholds for media vs. text).  
     - **Encryption settings** (if any).  

5. **UI Features**  
   - **Conversation list** with last message preview.  
   - **Conversation detail** with a chat-like view.  
   - **Attach file** or record button for audio/video.  
   - **Settings** panel to configure user Git credentials and provider details.

---

## 5. **Technical Stack Choices**

1. **Frontend**  
   - **Web**:  
     - **Framework**: Svelte.  
     - **State Management**: Redux, Vuex, Zustand, or Pinia.  
     - **UI Library**: TailwindCSS.  

2. **Backend / No Dedicated Server**  
   - The “backend” is effectively GitHub’s infrastructure plus the local Git client.

3. **Git Operations**  
   - Use the official **GitHub REST or GraphQL API** for file read/writes  
  

4. **Audio/Video**  
   - **WebRTC** via libraries like `simple-peer` ?
