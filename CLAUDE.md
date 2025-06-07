# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

- `npm run dev` - Start Vite development server on http://localhost:5173/
- `npm run build` - Production build to dist/
- `npm run preview` - Serve production build locally
- `npm run build:debug` - Debug build with source maps (used for GitHub Pages deployment)
- `npm run deploy` - Deploy to GitHub Pages (runs build:debug + gh-pages)

## Project Architecture

SkyGit is a serverless messaging application that uses GitHub repositories as the backend. Key architectural concepts:

### Core Components
- **Svelte SPA** with Vite build system and TailwindCSS styling
- **GitHub as Backend** - conversations stored in `.messages/` directory of user's `skygit-config` repo
- **PeerJS WebRTC** - simplified peer-to-peer messaging using PeerJS signaling infrastructure
- **Mesh Topology** - direct peer-to-peer connections between browsers for real-time messaging

### Authentication Flow
- Users paste GitHub Personal Access Token (PAT) on first use
- Token stored locally and used for all GitHub API calls
- App creates/initializes private `skygit-config` repo automatically

### Data Storage Pattern
- Conversations stored as JSON files in `.messages/` directory using human-readable filenames
- Filename format: `{repo_owner}_{repo_name}_{conversation_title}.json` (e.g., `ligdem_liquidity_first_test.json`)
- Automatic conflict resolution adds numeric suffixes for duplicate names
- Messages committed to GitHub for persistence
- Messages store actual GitHub usernames, display shows "You" for current user
- Local caching via stores for offline functionality

### Key Services
- `peerJsManager.js` - Manages PeerJS peer connections and discovery using GitHub files
- `conversationCommitQueue.js` - Batches and commits conversation data using human-readable filenames
- `conversationService.js` - Handles conversation creation, discovery, and filename conflict resolution
- `startupService.js` - Initializes app state on login

### Store Architecture
- `authStore` - Authentication state and user data
- `conversationStore` - Chat conversations and messages
- `repoStore` - Repository data and commit queues
- `routeStore` - Simple client-side routing
- `syncStateStore` - Background sync status

## Development Notes

- App is designed to work without any backend server
- All data persistence happens through GitHub API calls
- PeerJS handles real-time WebRTC communication with built-in signaling
- Peer discovery uses `.skygit/active-peers.json` file in GitHub repos
- PWA support included via vite-plugin-pwa
- Built for deployment on GitHub Pages with `/skygit/` base path

## Conversation File Format

Conversation files use human-readable naming and are stored in the `.messages/` directory:

### Filename Convention
- Format: `{repo_owner}_{repo_name}_{conversation_title}.json`
- Special characters in repo/title are replaced with underscores
- Conflicts resolved with numeric suffixes: `name_1.json`, `name_2.json`, etc.

### File Structure
```json
{
  "id": "uuid-v4",
  "repo": "owner/repository-name", 
  "title": "Human Readable Title",
  "createdAt": "2025-05-23T23:12:19.232Z",
  "participants": ["username1", "username2"],
  "messages": [
    {
      "id": "message-uuid",
      "sender": "github-username",
      "content": "Message text",
      "timestamp": 1716502339232
    }
  ]
}
```

### Important Notes
- Messages store actual GitHub usernames in `sender` field
- UI displays "You" for current user's messages but stores real username
- Conversation discovery loads ID and metadata from file content, not filename
- Only files matching `*_*.json` pattern in `.messages/` are discovered

## Task Management System

The project uses a file-based task management system with the following structure:
- `PROJECT_TODO.md` - Master task list organized by phases (P1, P2, etc.)
- `PROJECT_PRIORITIES.md` - Current priority tasks to focus on
- `.todo/` directory - Contains detailed subtask breakdowns
- `.todo/WORKFLOW.md` - Explains the task management workflow
- `.todo/TASK_TEMPLATE.md` - Template for creating new task files

**IMPORTANT**: Before starting any task from PROJECT_TODO.md:
1. Check if a detailed subtask file exists in the `.todo/` directory
2. If no subtask file exists, create one using the template at `.todo/TASK_TEMPLATE.md`
3. **PAUSE implementation** and wait for user validation of the subtask breakdown
4. Only proceed with implementation after subtasks are approved

### Task File Naming Convention
Tasks in the `.todo/` directory follow this naming pattern:
`P{phase}-{number}-{task-name}.md`

Examples:
- `P1-001-file-upload.md`
- `P2-003-conversation-export.md`
- `P3-012-voice-messages.md`