<script>
    import {
        X,
        Shield,
        Database,
        Server,
        Network,
        HardDrive,
    } from "lucide-svelte";
    import { fade, scale } from "svelte/transition";

    export let isOpen = false;
    export let onClose;
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        transition:fade
    >
        <!-- Backdrop -->
        <div
            class="absolute inset-0 bg-black/50 backdrop-blur-sm"
            on:click={onClose}
        ></div>

        <!-- Modal -->
        <div
            class="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 overflow-y-auto max-h-[90vh]"
            in:scale={{ start: 0.95 }}
        >
            <button
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                on:click={onClose}
            >
                <X size={24} />
            </button>

            <h2
                class="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2"
            >
                <Shield class="text-blue-600" />
                How SkyGit Works
            </h2>

            <div class="space-y-8 text-gray-600">
                <!-- Data Storage -->
                <div class="flex gap-4">
                    <div class="flex-shrink-0 mt-1">
                        <div
                            class="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
                        >
                            <Database size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg mb-2">
                            Where is my data stored?
                        </h3>
                        <p class="text-sm leading-relaxed">
                            SkyGit is <strong>serverless</strong>. We do not
                            have a database.
                            <br /><br />
                            All your data (conversations, settings, metadata) is
                            stored directly in
                            <strong>your own GitHub repositories</strong>.
                        </p>
                        <ul
                            class="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-600"
                        >
                            <li>
                                Global settings: stored in a private <code
                                    >skygit-config</code
                                > repo in your account.
                            </li>
                            <li>
                                Chat messages: stored in a hidden <code
                                    >.messages/</code
                                > folder inside each specific repository.
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Privacy -->
                <div class="flex gap-4">
                    <div class="flex-shrink-0 mt-1">
                        <div
                            class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"
                        >
                            <Shield size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg mb-2">
                            Who can see my messages?
                        </h3>
                        <p class="text-sm leading-relaxed">
                            Since data is stored in your GitHub repos, <strong
                                >access is controlled by GitHub permissions</strong
                            >.
                            <br />
                            Only people who have access to the repository (collaborators)
                            can see the messages associated with it. If the repo
                            is private, your chats are private.
                        </p>
                    </div>
                </div>

                <!-- PeerJS / Signaling -->
                <div class="flex gap-4">
                    <div class="flex-shrink-0 mt-1">
                        <div
                            class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"
                        >
                            <Server size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg mb-2">
                            What about the PeerJS Server?
                        </h3>
                        <p class="text-sm leading-relaxed">
                            We use a PeerJS server solely for <strong
                                >signaling</strong
                            >
                            (discovery).
                            <br />
                            It helps peers find each other to establish a connection.
                            <br /><br />
                            <strong
                                >No chat content or video streams pass through
                                this server.</strong
                            >
                            <br />
                            Only your Peer ID (derived from your username) and connection
                            metadata are temporarily processed to handshake.
                        </p>
                    </div>
                </div>

                <!-- P2P Transfer -->
                <div class="flex gap-4">
                    <div class="flex-shrink-0 mt-1">
                        <div
                            class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"
                        >
                            <Network size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg mb-2">
                            Real-time Communication
                        </h3>
                        <p class="text-sm leading-relaxed">
                            Once connected, all chats, audio, and video calls
                            are transmitted <strong
                                >directly between peers</strong
                            >
                            (Peer-to-Peer) using WebRTC.
                            <br />
                            This traffic is encrypted end-to-end by standard WebRTC
                            protocols and does not touch any central server.
                        </p>
                    </div>
                </div>

                <!-- File & Recording Storage -->
                <div class="flex gap-4">
                    <div class="flex-shrink-0 mt-1">
                        <div
                            class="w-10 h-10 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center"
                        >
                            <HardDrive size={20} />
                        </div>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-800 text-lg mb-2">
                            File & Recording Storage
                        </h3>
                        <p class="text-sm leading-relaxed">
                            You can save call recordings and shared files to:
                        </p>
                        <ul
                            class="list-disc ml-5 mt-2 space-y-1 text-sm text-gray-600"
                        >
                            <li>
                                <strong>S3 / Google Drive</strong>: Configure
                                external cloud storage in Settings for large
                                files.
                            </li>
                            <li>
                                <strong>Git Repository (GitFS)</strong>: No
                                setup needed! Small files (up to 50MB) are saved
                                directly in your repo.
                            </li>
                        </ul>
                        <p
                            class="text-xs text-amber-700 mt-2 bg-amber-50 p-2 rounded border border-amber-100"
                        >
                            <strong>GitFS Limits:</strong> Max 50MB per file, max
                            1GB total repo size.
                        </p>
                    </div>
                </div>
            </div>

            <div class="mt-8 pt-6 border-t flex justify-end">
                <button
                    class="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    on:click={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}
