// Persistent WebRTC data channel for SkyGit repo-wide peer mesh
export class SkyGitWebRTC {
  constructor({ token, repoFullName, peerUsername, isPersistent = false, onSignal, onRemoteStream, onDataChannelMessage }) {
    this.token = token;
    this.repoFullName = repoFullName;
    this.peerUsername = peerUsername;
    this.isPersistent = isPersistent;
    this.onSignal = onSignal;
    this.onRemoteStream = onRemoteStream;
    this.onDataChannelMessage = onDataChannelMessage;
    this.peerConnection = null;
    this.dataChannel = null;
    this.remoteDataChannel = null;
    this.signalingCallback = null; // Set by repoPeerManager for presence-based signaling
  }

  async start(isInitiator, offerSignal = null) {
    this.peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.signalingCallback) {
        this.signalingCallback({ type: 'ice', candidate: event.candidate });
      }
    };
    this.peerConnection.ontrack = (event) => {
      if (this.onRemoteStream) this.onRemoteStream(event.streams[0]);
    };
    this.peerConnection.ondatachannel = (event) => {
      this.remoteDataChannel = event.channel;
      this.setupDataChannel(event.channel);
    };

    if (isInitiator) {
      this.dataChannel = this.peerConnection.createDataChannel('skygit');
      this.setupDataChannel(this.dataChannel);
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      if (this.signalingCallback) this.signalingCallback({ type: 'offer', sdp: offer });
    } else if (offerSignal) {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerSignal.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      if (this.signalingCallback) this.signalingCallback({ type: 'answer', sdp: answer });
    }
  }

  setupDataChannel(channel) {
    channel.onopen = () => {};
    channel.onclose = () => {};
    channel.onerror = (e) => {};
    channel.onmessage = (event) => {
      if (this.onDataChannelMessage) {
        try {
          this.onDataChannelMessage(JSON.parse(event.data));
        } catch {
          this.onDataChannelMessage(event.data);
        }
      }
    };
  }

  async handleSignal(signal) {
    if (signal.type === 'offer') {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      if (this.signalingCallback) this.signalingCallback({ type: 'answer', sdp: answer });
    } else if (signal.type === 'answer') {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    } else if (signal.type === 'ice') {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
    }
    if (this.onSignal) this.onSignal(signal);
  }

  send(message) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
    }
  }

  stop() {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.remoteDataChannel) {
      this.remoteDataChannel.close();
      this.remoteDataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
  }
}
