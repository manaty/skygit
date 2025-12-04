<script>
    import { onMount } from "svelte";
    import { get } from "svelte/store";
    import { authStore } from "../stores/authStore.js";
    import {
        getNotifications,
        markAsRead,
        markAllAsRead,
        clearNotifications,
    } from "../services/notificationService.js";
    import {
        Bell,
        Phone,
        PhoneMissed,
        MessageSquare,
        UserPlus,
        Check,
        CheckCheck,
        Trash2,
        RefreshCw,
    } from "lucide-svelte";

    let notifications = [];
    let unreadCount = 0;
    let loading = true;
    let error = null;

    onMount(async () => {
        await fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    });

    async function fetchNotifications() {
        const auth = get(authStore);
        if (!auth?.token || !auth?.user?.login) {
            loading = false;
            return;
        }

        try {
            const data = await getNotifications(auth.token, auth.user.login);
            notifications = data.notifications;
            unreadCount = data.unreadCount;
            error = null;
        } catch (err) {
            console.error("[Notifications] Failed to fetch:", err);
            error = "Failed to load notifications";
        } finally {
            loading = false;
        }
    }

    async function handleMarkAsRead(notificationId) {
        const auth = get(authStore);
        if (auth?.token && auth?.user?.login) {
            await markAsRead(auth.token, auth.user.login, notificationId);
            await fetchNotifications();
        }
    }

    async function handleMarkAllAsRead() {
        const auth = get(authStore);
        if (auth?.token && auth?.user?.login) {
            await markAllAsRead(auth.token, auth.user.login);
            await fetchNotifications();
        }
    }

    async function handleClearAll() {
        if (!confirm("Clear all notifications?")) return;

        const auth = get(authStore);
        if (auth?.token && auth?.user?.login) {
            await clearNotifications(auth.token, auth.user.login);
            await fetchNotifications();
        }
    }

    function getIcon(type) {
        switch (type) {
            case "missed_call":
                return PhoneMissed;
            case "contact_request":
                return UserPlus;
            case "message":
                return MessageSquare;
            default:
                return Bell;
        }
    }

    function getIconColor(type) {
        switch (type) {
            case "missed_call":
                return "text-red-500";
            case "contact_request":
                return "text-blue-500";
            case "message":
                return "text-green-500";
            default:
                return "text-gray-500";
        }
    }

    function formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        if (diff < 60000) return "Just now";
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        return date.toLocaleDateString();
    }
</script>

<div class="p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Bell size={20} class="text-blue-600" />
            Notifications
            {#if unreadCount > 0}
                <span
                    class="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                >
                    {unreadCount}
                </span>
            {/if}
        </h2>
        <div class="flex items-center gap-1">
            <button
                class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                on:click={fetchNotifications}
                title="Refresh"
            >
                <RefreshCw size={16} />
            </button>
            {#if notifications.length > 0}
                <button
                    class="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded"
                    on:click={handleMarkAllAsRead}
                    title="Mark all as read"
                >
                    <CheckCheck size={16} />
                </button>
                <button
                    class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    on:click={handleClearAll}
                    title="Clear all"
                >
                    <Trash2 size={16} />
                </button>
            {/if}
        </div>
    </div>

    {#if loading}
        <div class="flex items-center justify-center py-8">
            <div
                class="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full"
            ></div>
        </div>
    {:else if error}
        <div class="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
            {error}
        </div>
    {:else if notifications.length === 0}
        <div class="text-center py-8 text-gray-500">
            <Bell size={48} class="mx-auto mb-3 opacity-30" />
            <p class="text-sm">No notifications</p>
            <p class="text-xs mt-1">You're all caught up!</p>
        </div>
    {:else}
        <div class="space-y-2">
            {#each notifications as notification (notification.id)}
                <div
                    class="flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer
            {notification.read
                        ? 'bg-white border-gray-200'
                        : 'bg-blue-50 border-blue-200'}"
                    on:click={() =>
                        !notification.read && handleMarkAsRead(notification.id)}
                >
                    <!-- Icon -->
                    <div class="flex-shrink-0 mt-0.5">
                        <svelte:component
                            this={getIcon(notification.type)}
                            size={18}
                            class={getIconColor(notification.type)}
                        />
                    </div>

                    <!-- Content -->
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-2">
                            <p
                                class="text-sm text-gray-800 {notification.read
                                    ? ''
                                    : 'font-medium'}"
                            >
                                {notification.message}
                            </p>
                            {#if !notification.read}
                                <div
                                    class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"
                                ></div>
                            {/if}
                        </div>

                        {#if notification.preview}
                            <p class="text-xs text-gray-500 mt-1 truncate">
                                "{notification.preview}"
                            </p>
                        {/if}

                        <p class="text-xs text-gray-400 mt-1">
                            {formatTime(notification.createdAt)}
                        </p>
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>
