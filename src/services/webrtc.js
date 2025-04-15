// Persistent WebRTC data channel for SkyGit repo-wide peer mesh
export class SkyGitWebRTC {
  constructor({ token, repoFullName, peerUsername, isPersistent = false, onSignal, onRemoteStream, onDataChannelMessage, onFileReceived, onFileReceiveProgress, onFileSendProgress }) {
    this.token = token;
    this.repoFullName = repoFullName;
    this.peerUsername = peerUsername;
    this.isPersistent = isPersistent;
    this.onSignal = onSignal;
    this.onRemoteStream = onRemoteStream;
    this.onDataChannelMessage = onDataChannelMessage;
    this.onFileReceived = onFileReceived;
    this.onFileReceiveProgress = onFileReceiveProgress;
    this.onFileSendProgress = onFileSendProgress;
    this.peerConnection = null;
    this.dataChannel = null;
    this.remoteDataChannel = null;
    this.signalingCallback = null; // Set by repoPeerManager for presence-based signaling
    this.fileTransfers = {};
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
    this._setupDataChannelHandlers();
  }

  _setupDataChannelHandlers() {
    if (this.dataChannel) {
      this.dataChannel.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleDataChannelMessage(msg);
        } catch (e) {
          console.error('Invalid data channel message:', event.data);
        }
      };
    }
  }

  handleDataChannelMessage(msg) {
    if (msg.type === 'screen-share') {
      if (typeof window !== 'undefined' && window.skygitOnScreenShare) {
        window.skygitOnScreenShare(msg.active, msg.meta);
      }
      return;
    }
    if (msg.type === 'media-status') {
      if (typeof window !== 'undefined' && window.skygitOnMediaStatus) {
        window.skygitOnMediaStatus({ micOn: msg.micOn, cameraOn: msg.cameraOn });
      }
      return;
    }
    if (msg.type && msg.type.startsWith('file-')) {
      this.handleFileMessage(msg);
    } else {
      if (this.onDataChannelMessage) {
        this.onDataChannelMessage(msg);
      }
    }
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

  sendScreenShareSignal(active, meta = {}) {
    this.send({ type: 'screen-share', active, meta });
  }

  sendFile(file) {
    const id = crypto.randomUUID();
    const chunkSize = 16 * 1024; // 16 KB
    const totalChunks = Math.ceil(file.size / chunkSize);
    const meta = { type: 'file-meta', id, name: file.name, size: file.size, totalChunks };
    this.send(meta);
    let offset = 0, seq = 0;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target.readyState !== FileReader.DONE) return;
      const arr = new Uint8Array(e.target.result);
      this.send({ type: 'file-chunk', id, seq, data: Array.from(arr) });
      seq++;
      offset += chunkSize;
      if (typeof this.onFileSendProgress === 'function') {
        this.onFileSendProgress(meta, seq, totalChunks);
      }
      if (offset < file.size) {
        readNext();
      } else {
        this.send({ type: 'file-end', id });
        if (typeof this.onFileSendProgress === 'function') {
          this.onFileSendProgress(meta, totalChunks, totalChunks);
        }
      }
    };
    const readNext = () => {
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsArrayBuffer(slice);
    };
    readNext();
  }

  handleFileMessage(msg) {
    if (msg.type === 'file-meta') {
      this.fileTransfers[msg.id] = { meta: msg, chunks: [], received: 0 };
      if (typeof this.onFileReceiveProgress === 'function') {
        this.onFileReceiveProgress(msg, 0, msg.totalChunks);
      }
    } else if (msg.type === 'file-chunk') {
      const transfer = this.fileTransfers[msg.id];
      if (transfer) {
        // Convert data array back to Uint8Array
        transfer.chunks[msg.seq] = new Uint8Array(msg.data);
        transfer.received++;
        if (typeof this.onFileReceiveProgress === 'function') {
          this.onFileReceiveProgress(transfer.meta, transfer.received, transfer.meta.totalChunks);
        }
      }
    } else if (msg.type === 'file-end') {
      const transfer = this.fileTransfers[msg.id];
      if (transfer) {
        // Reassemble
        const blob = new Blob(transfer.chunks, { type: 'application/octet-stream' });
        if (this.onFileReceived) this.onFileReceived(transfer.meta, blob);
        if (typeof this.onFileReceiveProgress === 'function') {
          this.onFileReceiveProgress(transfer.meta, transfer.meta.totalChunks, transfer.meta.totalChunks);
        }
        delete this.fileTransfers[msg.id];
      }
    }
  }

  // Replace the outgoing video track with a new one (for screen sharing)
  replaceVideoTrack(newTrack) {
    if (!this.peerConnection) return;
    // Find the sender for the video track
    const senders = this.peerConnection.getSenders();
    const videoSender = senders.find(s => s.track && s.track.kind === 'video');
    if (videoSender) {
      videoSender.replaceTrack(newTrack);
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
