/**
 * Call History Service
 * Stores and retrieves call history from the skygit-config repository.
 */

const CALL_HISTORY_PATH = 'call-history.json';
const REPO_NAME = 'skygit-config';

/**
 * Get the call history from the user's skygit-config repo.
 * @param {string} token - GitHub PAT
 * @param {string} username - GitHub username
 * @returns {Promise<Array>} - Array of call records
 */
export async function getCallHistory(token, username) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${CALL_HISTORY_PATH}`,
            {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );

        if (response.status === 404) {
            // File doesn't exist yet, return empty array
            return [];
        }

        if (!response.ok) {
            console.error('[CallHistory] Failed to fetch call history');
            return [];
        }

        const data = await response.json();
        const content = JSON.parse(atob(data.content));
        return content.calls || [];
    } catch (error) {
        console.error('[CallHistory] Error fetching call history:', error);
        return [];
    }
}

/**
 * Add a call record to the history.
 * @param {string} token - GitHub PAT
 * @param {string} username - GitHub username
 * @param {Object} callRecord - The call record to add
 */
export async function addCallToHistory(token, username, callRecord) {
    try {
        // First, get the current history and SHA
        let existingCalls = [];
        let sha = null;

        const getResponse = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${CALL_HISTORY_PATH}`,
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
            existingCalls = content.calls || [];
        }

        // Add the new call record at the beginning (most recent first)
        const newCalls = [callRecord, ...existingCalls];

        // Limit to last 100 calls to prevent file bloat
        const limitedCalls = newCalls.slice(0, 100);

        // Save back to GitHub
        const content = btoa(JSON.stringify({ calls: limitedCalls }, null, 2));

        const putBody = {
            message: `Add call record: ${callRecord.type} with ${callRecord.remotePeer}`,
            content: content
        };
        if (sha) {
            putBody.sha = sha;
        }

        const putResponse = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${CALL_HISTORY_PATH}`,
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
            console.error('[CallHistory] Failed to save call record');
        } else {
            console.log('[CallHistory] Call record saved successfully');
        }
    } catch (error) {
        console.error('[CallHistory] Error saving call record:', error);
    }
}

/**
 * Create a call record object.
 * @param {Object} options - Call details
 * @returns {Object} - Call record
 */
export function createCallRecord({
    remotePeer,
    type = 'video', // 'video' | 'audio'
    direction = 'outgoing', // 'incoming' | 'outgoing' | 'missed'
    startTime,
    endTime,
    duration, // in seconds
    recordingUrl = null,
    repoContext = null // which repo/conversation the call was from
}) {
    return {
        id: `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        remotePeer,
        type,
        direction,
        startTime: startTime || new Date().toISOString(),
        endTime: endTime || new Date().toISOString(),
        duration: duration || 0,
        recordingUrl,
        repoContext,
        createdAt: new Date().toISOString()
    };
}
