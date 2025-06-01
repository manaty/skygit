import { toasts } from "svelte-toasts";
import { createCallSession, getCallSession } from "./firestoreCall";
import { doc, updateDoc } from 'firebase/firestore';


const WebRTCEvent = (event: string) => `realtimeWebRTC_${event}`;

type WebRTCEvent = {
    event: string
    callback: (evt: any) => void
}

export class WebRTCClient {
    id: number;
    client: RTCPeerConnection | null;
    dataChannel: RTCDataChannel | null;

    conversationId: string | null;
    localPeer: string;
    remotePeer: string;
    paused: boolean;
    stopped: boolean;
    connectTime: number;

    listeners: WebRTCEvent[]
    audioEl: HTMLAudioElement | null;

    constructor({ conversationId, localPeer, remotePeer }: any) {
        this.id = Date.now();
        this.connectTime = 0;
        this.paused = false;
        this.stopped = false;
        this.client = null;
        this.dataChannel = null;
        this.listeners = [];
        this.audioEl = null;
        this.conversationId = conversationId;
        this.localPeer = localPeer;
        this.remotePeer = remotePeer;
    }

    isConnecting() {
        return !this.stopped && (Date.now() - this.connectTime < 2000 || Date.now() - this.id < 500);
    }

    async connect(needsOffer: boolean = false) {
        this.connectTime = Date.now();

        // Create a peer connection
        const pc = this.client ? this.client : new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
        this.client = pc;

        // Set up to play remote audio from the model
        pc.ontrack = e => {
            const remoteVideo = document.getElementById("remote-video") as HTMLVideoElement;
            remoteVideo.autoplay = true;
            remoteVideo.srcObject = null;
            remoteVideo.srcObject = e.streams[0];
        }
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                this.iceCandidate(event.candidate);
            }
        };
        // Set up data channel for sending and receiving events
        const dc = pc.createDataChannel("media");
        this.dataChannel = dc;
        this.dataChannel.onopen = () => {
            if (this.stopped) {
                this.disconnect();
                return;
            }
            // this.serveConnection();
            window.dispatchEvent(new CustomEvent(WebRTCEvent('rtcSessionConnected')));
        }
        this.dataChannel.addEventListener("message", (e: any) => {
            if (this.stopped) {
                this.disconnect();
                return;
            }
            // Realtime server events appear here!
            if (e.data) {
                window.dispatchEvent(new CustomEvent(WebRTCEvent('message'), { detail: e.data }));
            }
        });
        this.dataChannel.onerror = (e: any) => {
            window.dispatchEvent(new CustomEvent(WebRTCEvent('error'), { detail: e }));
        };
        this.dataChannel.onclose = (e: any) => {
            window.dispatchEvent(new CustomEvent(WebRTCEvent('close'), { detail: e }));
        };

        await this.serveConnection()
        // Start the session using the Session Description Protocol (SDP)
        const offer = await pc.createOffer({
            offerToReceiveVideo: true,
            offerToReceiveAudio: true,
        });
        await pc.setLocalDescription(offer);

        if (needsOffer) this.offerSdp(offer.sdp);
        return offer.sdp
    }

    async offerSdp(sdpText: string) {
        let session = await getCallSession(this.conversationId);
        if (session.exists()) {
            const sdpPeers = session.data().sdpPeers || {};
            sdpPeers[this.localPeer] = [{ sdp: sdpText, type: "offer", createdAt: Date.now() }];
            updateDoc(session.ref, {
                peer: this.localPeer,
                sdpPeers,
                updateAt: Date.now(),
            })
        }
    }

    async answerSdp(sdpText: string) {
        let session = await getCallSession(this.conversationId);
        if (session.exists()) {
            const sdpPeers = session.data().sdpPeers || {};
            const prev = sdpPeers[this.localPeer] || [];
            sdpPeers[this.localPeer] = [...prev, { sdp: sdpText, type: "answer", createdAt: Date.now() }];
            updateDoc(session.ref, {
                sdpPeers,
                updateAt: Date.now(),
            })
        }
    }

    async iceCandidate(candidate: RTCIceCandidateInit) {
        let session = await getCallSession(this.conversationId);
        if (session.exists()) {
            const iceCandidates = session.data().iceCandidates || {};
            iceCandidates[this.localPeer] = [{ candidate: JSON.stringify(candidate), type: "iceCandidate", createdAt: Date.now() }];
            updateDoc(session.ref, {
                iceCandidates,
                updateAt: Date.now(),
            })
        }
    }

    handleIceCandidate(signal: string) {
        const candidate = JSON.parse(signal);
        this.client.addIceCandidate(new RTCIceCandidate(candidate));
    }

    async handleOffer(sdpText: string) {
        const offer: RTCSessionDescriptionInit = {
            type: "offer",
            sdp: sdpText,
        };
        if (this.stopped && this.client) {
            this.disconnect();
            this.client.close();
        } else {
            await this.client.setRemoteDescription(new RTCSessionDescription(offer));
            await this.serveConnection()
            const _answer = await this.client.createAnswer({
                offerToReceiveVideo: true,
                offerToReceiveAudio: true,
            });
            await this.client.setLocalDescription(_answer);
            this.answerSdp(_answer.sdp);
        }
    }

    async handleAnswer(sdpText: string) {
        const answer: RTCSessionDescriptionInit = {
            type: "answer",
            sdp: sdpText,
        };
        if (this.stopped && this.client) {
            this.disconnect();
            this.client.close();
        } else {
            await this.serveConnection()
            await this.client.setRemoteDescription(new RTCSessionDescription(answer));
        }
    }

    serveConnection() {
        return new Promise((resolve) => {
            const pc = this.client;
            // Add local audio track for microphone input in the browser
            const constraints = { audio: true, video: { width: 640, height: 480 } };
            navigator.mediaDevices.getUserMedia(constraints)
                .then(stream => {
                    // Add tracks to the peer connection
                    stream.getTracks().forEach(track => {
                        pc.addTrack(track, stream);
                    });
                    const localVideo = document.getElementById("local-video") as HTMLVideoElement;
                    localVideo.autoplay = true;
                    localVideo.srcObject = stream;
                    resolve(true);
                })
                .catch(error => {
                    console.error('Error accessing media devices.', error);
                    resolve(false);
                });
        })
    }

    async send(message: string) {
        if (!this.dataChannel) return;
        this.dataChannel.send(message);
    }

    on(event: string, callback: any) {
        if (!this.listeners.find(e => e.event == event)) {
            this.listeners.push({ event, callback });
        }
        window.addEventListener(WebRTCEvent(event), callback);
    }

    removeAllListeners() {
        this.listeners.forEach(event => {
            window.removeEventListener(WebRTCEvent(event.event), event.callback);
        })
        this.listeners = [];
    }

    pause() {
        if (!this.dataChannel || !this.audioEl) return;
        this.paused = true;
        this.removeAllListeners();

        if (this.audioEl) {
            this.audioEl.pause();
        }
    }

    isPaused() {
        return this.paused && this.client && this.dataChannel
            && this.audioEl && this.audioEl.paused;
    }

    resume() {
        if (this.audioEl) {
            this.audioEl.play();
        }
    }

    forceStop() {
        this.stopped = true;
        this.connectTime = 0;
        this.disconnect();
    }

    disconnect() {
        if (!this.client) return;
        this.removeAllListeners();

        this.client.close();
        this.client = null;

        this.dataChannel?.close();
        this.dataChannel = null;

        if (this.audioEl) {
            this.audioEl.pause();
            this.audioEl.srcObject = null;
            this.audioEl = null;
        }
    }
}