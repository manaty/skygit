/**
 * Notification Mailbox Service
 * Stores and retrieves notifications in the user's skygit-config repository.
 * 
 * This enables "offline" notifications - when someone tries to contact you
 * while you're offline, they can leave a notification in your GitHub repo.
 * 
 * Storage: skygit-config/notifications.json
 */

const NOTIFICATIONS_PATH = 'notifications.json';
const REPO_NAME = 'skygit-config';

/**
 * Get all notifications for the current user.
 */
export async function getNotifications(token, username) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
            {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );

        if (response.status === 404) {
            return { notifications: [], unreadCount: 0 };
        }

        if (!response.ok) {
            console.error('[Notifications] Failed to fetch');
            return { notifications: [], unreadCount: 0 };
        }

        const data = await response.json();
        const content = JSON.parse(atob(data.content));
        const unreadCount = content.notifications.filter(n => !n.read).length;
        return { ...content, unreadCount };
    } catch (error) {
        console.error('[Notifications] Error:', error);
        return { notifications: [], unreadCount: 0 };
    }
}

/**
 * Add a notification to a user's mailbox.
 * This is called by the SENDER to notify the RECIPIENT.
 * 
 * @param {string} token - Sender's GitHub token
 * @param {string} recipientUsername - Username of the person to notify
 * @param {Object} notification - Notification object
 */
export async function sendNotification(token, recipientUsername, notification) {
    try {
        // First, get the current notifications and SHA
        let existingNotifications = [];
        let sha = null;

        const getResponse = await fetch(
            `https://api.github.com/repos/${recipientUsername}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
            {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );

        if (getResponse.ok) {
            const data = await getResponse.json();
            sha = data.sha;
            const content = JSON.parse(atob(data.content));
            existingNotifications = content.notifications || [];
        } else if (getResponse.status !== 404) {
            // If it's not a 404, we might not have permission
            console.warn('[Notifications] Cannot access recipient repo - they may not have SkyGit set up');
            return { success: false, error: 'Cannot access recipient notifications' };
        }

        // Add the new notification at the beginning
        const newNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
            ...notification,
            createdAt: new Date().toISOString(),
            read: false
        };

        const allNotifications = [newNotification, ...existingNotifications];

        // Limit to last 50 notifications
        const limitedNotifications = allNotifications.slice(0, 50);

        // Save back to GitHub
        const content = btoa(JSON.stringify({ notifications: limitedNotifications }, null, 2));
        const putBody = {
            message: `Notification from ${notification.from}: ${notification.type}`,
            content: content
        };
        if (sha) putBody.sha = sha;

        const putResponse = await fetch(
            `https://api.github.com/repos/${recipientUsername}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(putBody)
            }
        );

        if (!putResponse.ok) {
            console.error('[Notifications] Failed to send notification');
            return { success: false, error: 'Failed to send notification' };
        }

        return { success: true };
    } catch (error) {
        console.error('[Notifications] Error sending:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Mark a notification as read.
 */
export async function markAsRead(token, username, notificationId) {
    try {
        const data = await getNotifications(token, username);

        const notification = data.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
        }

        return await saveNotifications(token, username, data.notifications);
    } catch (error) {
        console.error('[Notifications] Error marking as read:', error);
        return false;
    }
}

/**
 * Mark all notifications as read.
 */
export async function markAllAsRead(token, username) {
    try {
        const data = await getNotifications(token, username);

        data.notifications.forEach(n => n.read = true);

        return await saveNotifications(token, username, data.notifications);
    } catch (error) {
        console.error('[Notifications] Error marking all as read:', error);
        return false;
    }
}

/**
 * Clear all notifications.
 */
export async function clearNotifications(token, username) {
    return await saveNotifications(token, username, []);
}

/**
 * Save notifications to the user's repo.
 */
async function saveNotifications(token, username, notifications) {
    try {
        let sha = null;
        const getResponse = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
            {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );

        if (getResponse.ok) {
            const data = await getResponse.json();
            sha = data.sha;
        }

        const content = btoa(JSON.stringify({ notifications }, null, 2));
        const putBody = {
            message: 'Update notifications',
            content: content
        };
        if (sha) putBody.sha = sha;

        const putResponse = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${NOTIFICATIONS_PATH}`,
            {
                method: 'PUT',
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(putBody)
            }
        );

        return putResponse.ok;
    } catch (error) {
        console.error('[Notifications] Error saving:', error);
        return false;
    }
}

/**
 * Create a missed call notification.
 */
export function createMissedCallNotification(fromUsername, callType = 'video') {
    return {
        type: 'missed_call',
        from: fromUsername,
        callType: callType,
        message: `Missed ${callType} call from ${fromUsername}`
    };
}

/**
 * Create a contact request notification.
 */
export function createContactRequestNotification(fromUsername) {
    return {
        type: 'contact_request',
        from: fromUsername,
        message: `${fromUsername} wants to add you as a contact`
    };
}

/**
 * Create a message notification.
 */
export function createMessageNotification(fromUsername, preview) {
    return {
        type: 'message',
        from: fromUsername,
        message: `New message from ${fromUsername}`,
        preview: preview?.substring(0, 50)
    };
}
