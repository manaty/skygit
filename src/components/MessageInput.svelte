<!-- ✅ src/components/MessageInput.svelte -->
<script>
  export let conversation;
  export let replyingTo = null; // Message being replied to
  export let repo = null; // Repository info for file uploads

  import { appendMessage } from "../stores/conversationStore.js";
  import { queueConversationForCommit } from "../services/conversationCommitQueue.js";
  import { authStore } from "../stores/authStore.js";
  import {
    onlinePeers,
    broadcastMessage,
    getLocalSessionId,
    getLocalPeerId,
    broadcastTypingStatus,
    startCall,
  } from "../services/peerJsManager.js";
  import { get } from "svelte/store";
  import {
    computeMessageHash,
    getPreviousMessageHash,
  } from "../utils/messageHash.js";
  import { uploadFile } from "../services/fileUploadService.js";
  import {
    sendNotification,
    createMessageNotification,
  } from "../services/notificationService.js";
  import { sortedContacts } from "../stores/contactsStore.js";
  import { Paperclip, Loader2, X, Video, AtSign } from "lucide-svelte";

  let message = "";
  let typingTimeout = null;
  let isTyping = false;
  let fileInput;
  let uploadingFile = false;
  let selectedFile = null;
  let inputElement;

  // @mention autocomplete state
  let showMentionPopup = false;
  let mentionQuery = "";
  let mentionStartIndex = -1;
  let selectedMentionIndex = 0;

  // Get contacts for autocomplete
  $: mentionSuggestions = $sortedContacts
    .filter((c) =>
      c.username.toLowerCase().includes(mentionQuery.toLowerCase()),
    )
    .slice(0, 5);

  function handleTyping() {
    // Start typing if not already
    if (!isTyping) {
      isTyping = true;
      broadcastTypingStatus(true);
    }

    // Reset timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeout = setTimeout(() => {
      isTyping = false;
      broadcastTypingStatus(false);
    }, 2000);
  }

  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
      selectedFile = file;
    }
  }

  async function removeSelectedFile() {
    selectedFile = null;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  // Handle @mention input
  function handleMentionInput(event) {
    const value = message;
    const cursorPos = inputElement?.selectionStart || 0;

    // Find @ before cursor
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      // Check if there's no space after @ (still typing username)
      if (!textAfterAt.includes(" ") && textAfterAt.length <= 20) {
        mentionQuery = textAfterAt;
        mentionStartIndex = lastAtIndex;
        showMentionPopup = true;
        selectedMentionIndex = 0;
        return;
      }
    }

    showMentionPopup = false;
    mentionQuery = "";
  }

  function selectMention(username) {
    // Replace @query with @username
    const before = message.substring(0, mentionStartIndex);
    const after = message.substring(
      mentionStartIndex + mentionQuery.length + 1,
    );
    message = `${before}@${username} ${after}`;
    showMentionPopup = false;
    mentionQuery = "";
    inputElement?.focus();
  }

  function handleMentionKeydown(event) {
    if (!showMentionPopup || mentionSuggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      selectedMentionIndex =
        (selectedMentionIndex + 1) % mentionSuggestions.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      selectedMentionIndex =
        (selectedMentionIndex - 1 + mentionSuggestions.length) %
        mentionSuggestions.length;
    } else if (event.key === "Tab" || event.key === "Enter") {
      if (showMentionPopup && mentionSuggestions.length > 0) {
        event.preventDefault();
        selectMention(mentionSuggestions[selectedMentionIndex].username);
      }
    } else if (event.key === "Escape") {
      showMentionPopup = false;
    }
  }

  // Extract @mentions from message
  function extractMentions(text) {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1]);
    }
    return [...new Set(mentions)]; // Remove duplicates
  }

  // Send notifications to mentioned users
  async function notifyMentionedUsers(messageContent, senderUsername, token) {
    const mentions = extractMentions(messageContent);

    for (const mentionedUser of mentions) {
      // Don't notify yourself
      if (mentionedUser.toLowerCase() === senderUsername.toLowerCase())
        continue;

      const notification = createMessageNotification(
        senderUsername,
        messageContent.substring(0, 100),
      );
      notification.type = "mention";
      notification.message = `${senderUsername} mentioned you`;

      // Try to send notification - might fail if user doesn't have SkyGit
      try {
        await sendNotification(token, mentionedUser, notification);
      } catch (err) {
        console.warn(`[Mention] Could not notify ${mentionedUser}:`, err);
      }
    }
  }

  async function send() {
    if (!message.trim() && !selectedFile) return;

    // Get the authenticated user's username
    const auth = get(authStore);
    const username = auth.user?.login;
    const token = auth.token;

    let fileUrl = null;
    let fileName = null;

    // Upload file if selected
    if (selectedFile && repo) {
      uploadingFile = true;
      try {
        const uploadResult = await uploadFile(selectedFile, repo, token);
        fileUrl = uploadResult.url;
        fileName = uploadResult.fileName;
      } catch (error) {
        console.error("File upload failed:", error);
        alert("Failed to upload file: " + error.message);
        uploadingFile = false;
        return;
      }
      uploadingFile = false;
    }

    // Construct message content
    let messageContent = message.trim();
    if (fileUrl) {
      // Add file link to message
      const fileLink = `[📎 ${fileName}](${fileUrl})`;
      messageContent = messageContent
        ? `${messageContent}\n\n${fileLink}`
        : fileLink;
    }

    if (!messageContent) return;

    // Get previous message hash for the chain
    const previousHash = getPreviousMessageHash(conversation.messages || []);

    // Compute hash for this message
    const messageHash = await computeMessageHash(
      previousHash,
      username || "Unknown",
      messageContent,
    );

    const newMessage = {
      id: crypto.randomUUID(),
      sender: username || "Unknown",
      content: messageContent,
      timestamp: Date.now(),
      hash: messageHash,
      in_response_to: replyingTo?.hash || null, // Include reply reference if replying
      attachment: fileUrl ? { url: fileUrl, fileName: fileName } : null,
      pending: true,
    };

    appendMessage(conversation.id, conversation.repo, newMessage);
    // Real-time relay: broadcast to all connected peers via PeerJS
    const chatMsg = {
      id: newMessage.id,
      conversationId: conversation.id,
      content: newMessage.content,
      timestamp: newMessage.timestamp,
      hash: newMessage.hash,
      in_response_to: newMessage.in_response_to,
      attachment: newMessage.attachment,
    };

    // Broadcast to conversation participants only
    broadcastMessage({ type: "chat", ...chatMsg }, conversation.id);

    // Queue for GitHub commit
    queueConversationForCommit(conversation.repo, conversation.id);

    // Notify mentioned users (async, don't block)
    notifyMentionedUsers(messageContent, username, token);

    // Stop typing indicator when message is sent
    if (isTyping) {
      isTyping = false;
      broadcastTypingStatus(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }

    message = "";
    showMentionPopup = false;
    replyingTo = null; // Clear reply reference
    selectedFile = null;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  // Check if storage is configured
  $: hasStorageConfigured =
    repo?.config?.binary_storage_type && repo?.config?.storage_info?.url;

  // Get available peers for calling
  // Filter by peer_id (not username) to allow same user on multiple devices

  $: localPeerId = getLocalPeerId();
  $: {
    console.log("[Call Debug] onlinePeers:", $onlinePeers);
    console.log("[Call Debug] localPeerId:", localPeerId);
    console.log(
      "[Call Debug] conversation.participants:",
      conversation?.participants,
    );
  }
  $: availablePeers = $onlinePeers.filter((p) => {
    // Exclude self by peer ID (allows same username on different sessions)
    if (p.session_id === localPeerId) return false;

    // If conversation has participants, check if peer is a participant
    // Otherwise, allow calling any connected peer
    if (conversation?.participants?.length > 0) {
      return conversation.participants.includes(p.username);
    }
    return true;
  });
  $: console.log("[Call Debug] availablePeers:", availablePeers);

  function initiateCall() {
    if (availablePeers.length > 0) {
      // For MVP, just call the first available peer
      // In future, show a selector if multiple peers
      startCall(availablePeers[0].session_id);
    } else {
      alert("No online peers to call in this conversation.");
    }
  }
</script>

<div class="space-y-2">
  {#if replyingTo}
    <div
      class="bg-gray-100 px-3 py-2 rounded text-sm flex items-center justify-between"
    >
      <div class="flex-1">
        <div class="text-xs text-gray-500 mb-1">
          Replying to {replyingTo.sender}
        </div>
        <div class="text-gray-700 truncate">{replyingTo.content}</div>
      </div>
      <button
        class="ml-2 text-gray-500 hover:text-gray-700"
        on:click={() => (replyingTo = null)}
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  {/if}

  {#if selectedFile}
    <div
      class="bg-blue-50 px-3 py-2 rounded text-sm flex items-center justify-between"
    >
      <div class="flex items-center gap-2 flex-1">
        <Paperclip class="w-4 h-4 text-blue-600" />
        <span class="text-blue-700 truncate">{selectedFile.name}</span>
        <span class="text-xs text-blue-500"
          >({(selectedFile.size / 1024).toFixed(1)} KB)</span
        >
      </div>
      <button
        class="ml-2 text-blue-500 hover:text-blue-700"
        on:click={removeSelectedFile}
        disabled={uploadingFile}
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  {/if}

  <div class="flex items-center gap-2">
    {#if hasStorageConfigured}
      <input
        type="file"
        bind:this={fileInput}
        on:change={handleFileSelect}
        class="hidden"
        disabled={uploadingFile}
      />
      <button
        class="text-gray-500 hover:text-gray-700 p-2"
        on:click={() => fileInput.click()}
        disabled={uploadingFile}
        title="Attach file"
      >
        {#if uploadingFile}
          <Loader2 class="w-5 h-5 animate-spin" />
        {:else}
          <Paperclip class="w-5 h-5" />
        {/if}
      </button>
    {/if}

    <button
      class="text-gray-500 hover:text-gray-700 p-2"
      on:click={initiateCall}
      title={availablePeers.length > 0
        ? `Call ${availablePeers[0].username}`
        : "No peers online"}
      disabled={availablePeers.length === 0}
    >
      <Video
        class="w-5 h-5 {availablePeers.length > 0
          ? 'text-green-600'
          : 'text-gray-300'}"
      />
    </button>

    <div class="relative flex-1">
      <input
        type="text"
        bind:value={message}
        bind:this={inputElement}
        placeholder={replyingTo
          ? "Type your reply... (@ to mention)"
          : "Type a message... (@ to mention)"}
        class="w-full border rounded px-3 py-2 text-sm"
        on:keydown={(e) => {
          handleMentionKeydown(e);
          if (e.key === "Enter" && !e.shiftKey && !showMentionPopup) send();
        }}
        on:input={(e) => {
          handleTyping();
          handleMentionInput(e);
        }}
        disabled={uploadingFile}
      />

      <!-- @mention autocomplete popup -->
      {#if showMentionPopup && mentionSuggestions.length > 0}
        <div
          class="absolute bottom-full left-0 mb-1 w-64 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto z-50"
        >
          {#each mentionSuggestions as suggestion, i (suggestion.username)}
            <button
              class="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 text-left
                {i === selectedMentionIndex ? 'bg-blue-50' : ''}"
              on:click={() => selectMention(suggestion.username)}
            >
              <img
                src="https://github.com/{suggestion.username}.png"
                alt={suggestion.username}
                class="w-6 h-6 rounded-full"
              />
              <span class="font-medium text-sm">@{suggestion.username}</span>
              {#if suggestion.online}
                <span class="w-2 h-2 bg-green-500 rounded-full ml-auto"></span>
              {/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <button
      class="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded disabled:opacity-50"
      on:click={send}
      disabled={uploadingFile || (!message.trim() && !selectedFile)}
    >
      {uploadingFile ? "Uploading..." : "Send"}
    </button>
  </div>
</div>
