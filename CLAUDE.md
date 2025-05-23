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
- **WebRTC Peer-to-Peer** - real-time messaging and video calls without servers
- **Star Topology** - one elected leader per repo manages WebRTC connections to all peers

### Authentication Flow
- Users paste GitHub Personal Access Token (PAT) on first use
- Token stored locally and used for all GitHub API calls
- App creates/initializes private `skygit-config` repo automatically

### Data Storage Pattern
- Conversations stored as JSON files in `.messages/` directory
- Leader commits batched messages every 10 minutes and on browser unload
- Local caching via stores for offline functionality

### Key Services
- `githubSignaling.js` - Uses GitHub Discussions for WebRTC signaling
- `repoPeerManager.js` - Manages WebRTC peer connections and leader election
- `conversationCommitQueue.js` - Batches and commits conversation data
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
- WebRTC handles real-time communication between peers
- PWA support included via vite-plugin-pwa
- Built for deployment on GitHub Pages with `/skygit/` base path