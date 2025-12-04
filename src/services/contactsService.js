/**
 * Contacts Service
 * Manages contacts stored in the user's skygit-config repository.
 * 
 * Contacts are stored as:
 * - contacts.json: Main contact list with favorites and custom data
 * - contact-requests.json: Pending incoming/outgoing requests
 */

const CONTACTS_PATH = 'contacts.json';
const REQUESTS_PATH = 'contact-requests.json';
const REPO_NAME = 'skygit-config';

/**
 * Get all saved contacts from the user's skygit-config repo.
 */
export async function getSavedContacts(token, username) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${CONTACTS_PATH}`,
            {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );

        if (response.status === 404) {
            return { contacts: [], favorites: [] };
        }

        if (!response.ok) {
            console.error('[Contacts] Failed to fetch contacts');
            return { contacts: [], favorites: [] };
        }

        const data = await response.json();
        return JSON.parse(atob(data.content));
    } catch (error) {
        console.error('[Contacts] Error fetching contacts:', error);
        return { contacts: [], favorites: [] };
    }
}

/**
 * Save/update contacts to the user's skygit-config repo.
 */
export async function saveContacts(token, username, contactsData) {
    try {
        // Get existing SHA
        let sha = null;
        const getResponse = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${CONTACTS_PATH}`,
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

        const content = btoa(JSON.stringify(contactsData, null, 2));
        const putBody = {
            message: 'Update contacts',
            content: content
        };
        if (sha) putBody.sha = sha;

        const putResponse = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${CONTACTS_PATH}`,
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
        console.error('[Contacts] Error saving contacts:', error);
        return false;
    }
}

/**
 * Add a contact to the user's contact list.
 */
export async function addContact(token, username, contactUsername, nickname = null) {
    const data = await getSavedContacts(token, username);

    // Check if already exists
    if (data.contacts.find(c => c.username === contactUsername)) {
        return { success: false, error: 'Contact already exists' };
    }

    data.contacts.push({
        username: contactUsername,
        nickname: nickname,
        addedAt: new Date().toISOString()
    });

    const success = await saveContacts(token, username, data);
    return { success, error: success ? null : 'Failed to save contact' };
}

/**
 * Remove a contact from the user's contact list.
 */
export async function removeContact(token, username, contactUsername) {
    const data = await getSavedContacts(token, username);
    data.contacts = data.contacts.filter(c => c.username !== contactUsername);
    data.favorites = data.favorites.filter(f => f !== contactUsername);
    return await saveContacts(token, username, data);
}

/**
 * Toggle a contact as favorite.
 */
export async function toggleFavorite(token, username, contactUsername) {
    const data = await getSavedContacts(token, username);

    if (data.favorites.includes(contactUsername)) {
        data.favorites = data.favorites.filter(f => f !== contactUsername);
    } else {
        data.favorites.push(contactUsername);
    }

    return await saveContacts(token, username, data);
}

/**
 * Get contact requests (incoming and outgoing).
 */
export async function getContactRequests(token, username) {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${REQUESTS_PATH}`,
            {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );

        if (response.status === 404) {
            return { incoming: [], outgoing: [] };
        }

        if (!response.ok) {
            return { incoming: [], outgoing: [] };
        }

        const data = await response.json();
        return JSON.parse(atob(data.content));
    } catch (error) {
        console.error('[Contacts] Error fetching requests:', error);
        return { incoming: [], outgoing: [] };
    }
}

/**
 * Send a contact request to another user.
 * This creates a request in YOUR repo (outgoing) and would need
 * to be picked up by the other user's client.
 */
export async function sendContactRequest(token, username, targetUsername) {
    const requests = await getContactRequests(token, username);

    // Check if already sent
    if (requests.outgoing.find(r => r.username === targetUsername)) {
        return { success: false, error: 'Request already sent' };
    }

    requests.outgoing.push({
        username: targetUsername,
        sentAt: new Date().toISOString(),
        status: 'pending'
    });

    // Save to repo
    try {
        let sha = null;
        const getResponse = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${REQUESTS_PATH}`,
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

        const content = btoa(JSON.stringify(requests, null, 2));
        const putBody = {
            message: `Send contact request to ${targetUsername}`,
            content: content
        };
        if (sha) putBody.sha = sha;

        const putResponse = await fetch(
            `https://api.github.com/repos/${username}/${REPO_NAME}/contents/${REQUESTS_PATH}`,
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

        return { success: putResponse.ok };
    } catch (error) {
        console.error('[Contacts] Error sending request:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Search GitHub users by username.
 */
export async function searchGitHubUsers(token, query) {
    if (!query || query.length < 2) return [];

    try {
        const response = await fetch(
            `https://api.github.com/search/users?q=${encodeURIComponent(query)}&per_page=10`,
            {
                headers: {
                    Authorization: `token ${token}`,
                    Accept: 'application/vnd.github.v3+json'
                }
            }
        );

        if (!response.ok) return [];

        const data = await response.json();
        return data.items.map(user => ({
            username: user.login,
            avatarUrl: user.avatar_url,
            htmlUrl: user.html_url
        }));
    } catch (error) {
        console.error('[Contacts] Error searching users:', error);
        return [];
    }
}
