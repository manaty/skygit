# SkyGit - Current Priority Tasks

## Immediate Priorities (Next Sprint)

### 1. WebRTC Audio/Video Calls (P1-001)
**Why**: Real-time communication is essential for collaboration beyond text messaging
**Impact**: Very High - Major feature addition that differentiates the platform
**Effort**: High
**Status**: Assigned to @dragons3232
**Note**: Basic WebRTC infrastructure already in place via PeerJS

### 2. Message Replies/Threading (P1-002)
**Why**: Essential for following conversation context and organizing discussions
**Impact**: Very High - Core messaging functionality
**Effort**: Medium
**Status**: Ready to start
**Note**: Critical for maintaining conversation coherence in group chats

### 3. File Upload/Download for Conversations (P1-003)
**Why**: Users frequently need to share files in conversations, currently limited to text only
**Impact**: High - Core functionality enhancement
**Effort**: Medium
**Status**: Ready to start

### 4. Message Editing and Deletion (P1-004)
**Why**: Users need ability to correct mistakes and remove messages
**Impact**: High - Essential messaging feature
**Effort**: Low-Medium
**Status**: Ready to start

## Next Up (Following Sprint)

### 5. Audio/Video Recording with Cloud Storage (P2-001)
**Why**: Users need to record and share audio/video messages asynchronously
**Impact**: High - Extends communication options
**Effort**: Medium
**Status**: Ready after WebRTC calls implementation
**Note**: Will leverage S3/Google Drive integration already in place

### 6. Conversation Search (P1-005)
**Why**: Finding specific messages in long conversations is difficult
**Impact**: Medium-High - Improves usability significantly
**Effort**: Medium
**Status**: Ready to start

### 7. Notification System (P2-004)
**Why**: Users miss new messages when not actively viewing app
**Impact**: High - Critical for engagement
**Effort**: High
**Status**: Needs architecture planning

## Recently Completed
- ✅ Organization-based repository grouping
- ✅ Unified search for repos and conversations
- ✅ Auto-select single conversation on search
- ✅ "View conversations" link from repo details
- ✅ Typing indicators with real-time updates
- ✅ Basic WebRTC peer-to-peer connection infrastructure

## Notes
- Priority order may change based on user feedback
- Each task requires detailed subtask breakdown before starting
- See PROJECT_TODO.md for complete task list
- Check .todo/ directory for detailed task specifications