// Google OAuth 2.0 flow for Google Drive integration
// This uses the OAuth 2.0 implicit flow suitable for client-side apps

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REDIRECT_URI = window.location.origin + '/skygit/';

// Scopes needed for Google Drive access
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Create and access files created by the app
  'https://www.googleapis.com/auth/drive.appdata' // Access app configuration data
].join(' ');

// You'll need to register your app with Google Cloud Console to get this
// For demo purposes, using a placeholder - in production, this should be configured
const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

/**
 * Initiates Google OAuth flow
 * Opens a popup window for user to authenticate with Google
 */
export function initiateGoogleAuth() {
  // Check if client ID is configured
  if (CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    return {
      error: true,
      message: 'Google OAuth is not configured. Please follow the setup instructions.',
      instructions: getSetupInstructions()
    };
  }

  // Generate a random state for security
  const state = crypto.randomUUID();
  sessionStorage.setItem('google_oauth_state', state);

  // Build the authorization URL
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline', // Request refresh token
    prompt: 'consent', // Force consent screen to ensure refresh token
    state: state
  });

  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;

  // Open in popup window
  const width = 500;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;

  const popup = window.open(
    authUrl,
    'google-auth',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  return new Promise((resolve, reject) => {
    // Check if popup was blocked
    if (!popup || popup.closed) {
      reject(new Error('Popup was blocked. Please allow popups for this site.'));
      return;
    }

    // Listen for messages from the popup
    const messageHandler = async (event) => {
      // Verify origin
      if (event.origin !== window.location.origin) return;

      if (event.data.type === 'google-auth-success') {
        window.removeEventListener('message', messageHandler);
        popup.close();

        // Verify state
        const savedState = sessionStorage.getItem('google_oauth_state');
        if (event.data.state !== savedState) {
          reject(new Error('Invalid state. Possible CSRF attack.'));
          return;
        }

        // Exchange authorization code for tokens
        try {
          const tokens = await exchangeCodeForTokens(event.data.code);
          resolve(tokens);
        } catch (error) {
          reject(error);
        }
      } else if (event.data.type === 'google-auth-error') {
        window.removeEventListener('message', messageHandler);
        popup.close();
        reject(new Error(event.data.error));
      }
    };

    window.addEventListener('message', messageHandler);

    // Check if popup is closed
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        window.removeEventListener('message', messageHandler);
        reject(new Error('Authentication cancelled'));
      }
    }, 1000);
  });
}

/**
 * Exchange authorization code for access and refresh tokens
 * Note: This typically requires a backend server to keep client_secret secure
 * For a pure client-side app, you'd need to use a different flow
 */
async function exchangeCodeForTokens(code) {
  // In a real implementation, this would call your backend server
  // which would then exchange the code for tokens using the client_secret
  
  // For now, return a placeholder indicating this step needs backend support
  return {
    needsBackend: true,
    instructions: `
To complete Google Drive integration, you need to:

1. Set up a backend service to handle the OAuth token exchange
2. The backend should exchange the authorization code for tokens
3. Return the refresh_token to store in SkyGit

Alternatively, you can manually create OAuth credentials:
1. Go to Google Cloud Console
2. Create OAuth 2.0 credentials
3. Use a tool like Postman to get a refresh token
4. Enter the credentials manually in Settings
    `
  };
}

/**
 * Handle OAuth callback (for the popup window)
 * This should be called when the redirect URI is loaded
 */
export function handleGoogleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    // Send error message to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'google-auth-error',
        error: error
      }, window.location.origin);
    }
    return;
  }

  if (code && state) {
    // Send success message to parent window
    if (window.opener) {
      window.opener.postMessage({
        type: 'google-auth-success',
        code: code,
        state: state
      }, window.location.origin);
    }
  }
}

/**
 * Get setup instructions for configuring Google OAuth
 */
function getSetupInstructions() {
  return `
# Setting up Google OAuth for SkyGit

## Step 1: Create a Google Cloud Project
1. Go to https://console.cloud.google.com
2. Create a new project or select an existing one
3. Enable the Google Drive API

## Step 2: Create OAuth 2.0 Credentials
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Choose "Web application"
4. Add authorized redirect URI: ${REDIRECT_URI}
5. Copy the Client ID

## Step 3: Configure SkyGit
1. Update CLIENT_ID in src/services/googleOAuth.js
2. Rebuild and deploy the application

## Alternative: Manual Token Generation
If you prefer not to implement OAuth flow:

1. Use Google's OAuth Playground: https://developers.google.com/oauthplayground/
2. Select Google Drive API v3 scopes
3. Authorize and get refresh token
4. Manually enter credentials in Settings

Note: For production use, implement a backend service to securely handle
the OAuth flow and protect your client secret.
  `;
}

/**
 * Helper to check if we're on the OAuth callback page
 */
export function isOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  return params.has('code') && params.has('state');
}