// Minimal WebRTC + GitHub Discussions signaling integration for SkyGit
import { postSignal, pollSignals } from '../services/githubSignaling.js';

// This is a minimal stub for initiating a WebRTC connection using GitHub Discussions as the signaling channel
export class SkyGitWebRTC {
  constructor({ token, repoFullName, conversationId, onSignal, onRemoteStream }) {
    this.token = token;
    this.repoFullName = repoFullName;
    this.conversationId = conversationId;
    this.onSignal = onSignal; // callback for local ICE/SDP
    this.onRemoteStream = onRemoteStream; // callback for remote stream
    this.peerConnection = null;
    this.polling = false;
    this.lastCommentId = null;
  }

  async start(isInitiator) {
    // Create RTCPeerConnection
    this.peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.sendSignal({ type: 'ice', candidate: event.candidate });
      }
    };
    this.peerConnection.ontrack = (event) => {
      if (this.onRemoteStream) this.onRemoteStream(event.streams[0]);
    };

    // If initiator, create and send offer
    if (isInitiator) {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      this.sendSignal({ type: 'offer', sdp: offer });
    }

    // Start polling for remote signals
    this.polling = true;
    this.pollSignalsLoop();
  }

  async sendSignal(signal) {
    await postSignal(this.token, this.repoFullName, this.conversationId, signal);
  }

  async pollSignalsLoop() {
    while (this.polling) {
      const signals = await pollSignals(this.token, this.repoFullName, this.conversationId, this.lastCommentId);
      for (const s of signals) {
        this.lastCommentId = s.id;
        this.handleRemoteSignal(s.signal);
      }
      await new Promise(r => setTimeout(r, 2000)); // poll every 2s
    }
  }

  async handleRemoteSignal(signal) {
    if (signal.type === 'offer') {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      this.sendSignal({ type: 'answer', sdp: answer });
    } else if (signal.type === 'answer') {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    } else if (signal.type === 'ice') {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
    if (this.onSignal) this.onSignal(signal);
  }

  stop() {
    this.polling = false;
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
