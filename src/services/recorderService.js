export class CallRecorder {
    constructor() {
        this.mediaRecorder = null;
        this.recordedChunks = [];
    }

    startRecording(remoteStream, localStream) {
        this.recordedChunks = [];

        // Create a combined stream with tracks from both sources
        const combinedStream = new MediaStream();

        // Add remote video and audio
        remoteStream.getTracks().forEach(track => {
            combinedStream.addTrack(track);
        });

        // Add local audio (we don't add local video to keep it simple/clean)
        localStream.getAudioTracks().forEach(track => {
            combinedStream.addTrack(track);
        });

        try {
            this.mediaRecorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp8,opus'
            });
        } catch (e) {
            // Fallback if specific codec not supported
            console.warn('VP8/Opus not supported, trying default mimeType');
            this.mediaRecorder = new MediaRecorder(combinedStream);
        }

        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.recordedChunks.push(event.data);
            }
        };

        this.mediaRecorder.start();
        console.log('[Recorder] Started recording');
    }

    stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.mediaRecorder) {
                reject('No active recorder');
                return;
            }

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, {
                    type: 'video/webm'
                });
                this.recordedChunks = [];
                this.mediaRecorder = null;
                resolve(blob);
            };

            this.mediaRecorder.stop();
            console.log('[Recorder] Stopped recording');
        });
    }

    downloadRecording(blob, filename = 'call-recording.webm') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style = 'display: none';
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
}

export const recorder = new CallRecorder();
