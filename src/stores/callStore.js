import { writable } from 'svelte/store';

// Call status: 'idle' | 'calling' | 'incoming' | 'connected' | 'ending'
export const callStatus = writable('idle');
export const remoteStream = writable(null);
export const localStream = writable(null);
export const remotePeerId = writable(null);
export const isVideoEnabled = writable(true);
export const isAudioEnabled = writable(true);
export const isScreenSharing = writable(false);
export const isRecording = writable(false);
export const callStartTime = writable(null);

export function resetCallState() {
    callStatus.set('idle');
    remoteStream.set(null);
    localStream.set(null);
    remotePeerId.set(null);
    isVideoEnabled.set(true);
    isAudioEnabled.set(true);
    isScreenSharing.set(false);
    isRecording.set(false);
    callStartTime.set(null);
}
