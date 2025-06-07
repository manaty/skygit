# Task: WebRTC Audio/Video Calls

## Overview
**Phase**: P1
**Category**: Core Functionality
**Priority**: High
**Estimated Time**: 2-3 weeks
**Dependencies**: PeerJS infrastructure (already in place)
**Status**: [x] Assigned | [ ] In Progress | [ ] Completed | [ ] Blocked
**Assigned to**: Long (@dragons3232)

## Description
Implement full WebRTC-based audio and video calling functionality within conversations. This will allow users to initiate real-time voice and video calls with other participants in a conversation, building on the existing PeerJS infrastructure.

## Acceptance Criteria
- [ ] Users can initiate voice calls from within a conversation
- [ ] Users can initiate video calls from within a conversation
- [ ] Incoming call notifications are displayed prominently
- [ ] Users can accept/reject incoming calls
- [ ] Call quality adapts to network conditions
- [ ] Users can toggle microphone on/off during calls
- [ ] Users can toggle camera on/off during calls
- [ ] Call state persists if user navigates away and returns
- [ ] Multiple participants can join a call (group calls)
- [ ] Screen sharing functionality during calls

## Technical Requirements
- **Technologies**: WebRTC, PeerJS (existing), MediaStream API
- **APIs**: getUserMedia, RTCPeerConnection
- **Permissions**: Microphone and camera access
- **Browser Support**: Chrome, Firefox, Safari, Edge

## Implementation Steps
1. [ ] Design call UI components (call button, in-call interface, notifications)
2. [ ] Implement call initiation and signaling through PeerJS
3. [ ] Handle media stream acquisition (mic/camera permissions)
4. [ ] Implement call acceptance/rejection flow
5. [ ] Create in-call controls (mute, camera toggle, hang up)
6. [ ] Add call state management in stores
7. [ ] Implement screen sharing functionality
8. [ ] Handle call quality adaptation
9. [ ] Add group call support (mesh or SFU approach)
10. [ ] Implement call reconnection logic
11. [ ] Add call history/logs
12. [ ] Create comprehensive error handling

## Resources & References
- [PeerJS Documentation](https://peerjs.com/docs/)
- [WebRTC API](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [MediaStream API](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream)
- Existing PeerJS implementation in `src/services/peerJsManager.js`

## Notes & Considerations
- Leverage existing PeerJS connection management
- Consider bandwidth limitations for group calls
- Implement graceful degradation for poor connections
- Ensure mobile browser compatibility
- Handle browser permission prompts elegantly
- Consider implementing TURN server for NAT traversal
- May need to implement SFU for larger group calls

## Testing Checklist
- [ ] Test calls between different browsers
- [ ] Test calls on different networks (including mobile)
- [ ] Test permission denial scenarios
- [ ] Test call quality in poor network conditions
- [ ] Test multiple simultaneous calls
- [ ] Test call persistence across navigation
- [ ] Test group calls with 3+ participants

## Code Review Checklist
- [ ] Media streams properly cleaned up
- [ ] No memory leaks from unclosed connections
- [ ] Proper error handling for all failure modes
- [ ] Accessible UI for call controls
- [ ] Security considerations for peer connections

## Related Tasks
- **Blocks**: P2-001 (Audio/Video Recording)
- **Related**: P1-002 (Message Replies) - for better call context

## Progress Log
| Date | Developer | Status Update |
|------|-----------|---------------|
| 2024-01-07 | @manaty | Task created and assigned to @dragons3232 |

## Questions & Blockers
- [ ] Determine approach for group calls (mesh vs SFU)
- [ ] TURN server configuration needed?

## Definition of Done
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Documentation updated
- [ ] Works across all supported browsers
- [ ] Performance acceptable for group calls