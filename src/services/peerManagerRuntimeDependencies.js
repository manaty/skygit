import {
  appendMessage,
  appendMessages,
  committedEvents,
  conversations,
  markMessagesCommitted
} from '../stores/conversationStore.js';
import { queueConversationForCommit, flushConversationCommitQueue } from './conversationCommitQueue.js';
import { authStore } from '../stores/authStore.js';
import { updateContact, setLastMessage, loadContacts } from '../stores/contactsStore.js';
import {
  callStatus,
  localStream,
  remoteStream,
  remotePeerId,
  isVideoEnabled,
  isAudioEnabled,
  isScreenSharing,
  callStartTime,
  resetCallState
} from '../stores/callStore.js';

export function createPeerManagerRuntimeDependencies({ PeerClass, peerStores }) {
  return {
    PeerClass,
    authStore,
    conversations,
    committedEvents,
    appendMessage,
    appendMessages,
    markMessagesCommitted,
    queueConversationForCommit,
    flushConversationCommitQueue,
    loadContacts,
    updateContact,
    setLastMessage,
    peerStores,
    callStores: {
      callStatus,
      localStream,
      remoteStream,
      remotePeerId,
      isVideoEnabled,
      isAudioEnabled,
      isScreenSharing,
      callStartTime
    },
    resetCallState
  };
}
