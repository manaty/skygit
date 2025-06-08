// Google OAuth 2.0 with PKCE flow for client-side apps
// This allows secure OAuth without exposing client_secret

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REDIRECT_URI = window.location.origin + '/skygit/';

// Scopes needed for Google Drive access
const SCOPES = [
  'https://www.googleapis.com/auth/drive.file', // Create and access files created by the app
  'https://www.googleapis.com/auth/drive.appdata' // Access app configuration data
].join(' ');

// For PKCE flow, you only need client_id (no secret required!)
// Users need to create this in Google Cloud Console
const CLIENT_ID = localStorage.getItem('skygit_google_client_id') || '';

/**
 * Generate code verifier for PKCE
 */
function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Generate code challenge from verifier
 */
async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Save or get Google Client ID
 */
export function setGoogleClientId(clientId) {
  localStorage.setItem('skygit_google_client_id', clientId);
}

export function getGoogleClientId() {
  return localStorage.getItem('skygit_google_client_id') || '';
}

/**
 * Initiates Google OAuth with PKCE flow
 */
export async function initiateGoogleAuthPKCE() {
  const clientId = getGoogleClientId();
  
  if (!clientId) {
    return {
      error: true,
      needsClientId: true,
      message: 'Please configure Google Client ID first'
    };
  }

  // Generate PKCE parameters
  const state = crypto.randomUUID();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store for later use
  sessionStorage.setItem('google_oauth_state', state);
  sessionStorage.setItem('google_oauth_verifier', codeVerifier);

  // Build authorization URL with PKCE parameters
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES,
    access_type: 'offline', // Request refresh token
    prompt: 'consent', // Force consent to get refresh token
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  const authUrl = `${GOOGLE_AUTH_URL}?${params.toString()}`;

  // Open in popup
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
    if (!popup || popup.closed) {
      reject(new Error('Popup was blocked. Please allow popups for this site.'));
      return;
    }

    const messageHandler = async (event) => {
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

        // Exchange code for tokens using PKCE
        try {
          const tokens = await exchangeCodeForTokensPKCE(event.data.code);
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
 * Exchange authorization code for tokens using PKCE
 * No client_secret needed!
 */
async function exchangeCodeForTokensPKCE(code) {
  const clientId = getGoogleClientId();
  const codeVerifier = sessionStorage.getItem('google_oauth_verifier');
  
  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  const params = new URLSearchParams({
    code: code,
    client_id: clientId,
    code_verifier: codeVerifier,
    redirect_uri: REDIRECT_URI,
    grant_type: 'authorization_code'
  });

  try {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error_description || 'Token exchange failed');
    }

    // Clean up session storage
    sessionStorage.removeItem('google_oauth_state');
    sessionStorage.removeItem('google_oauth_verifier');

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      token_type: data.token_type
    };
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
}

/**
 * Handle OAuth callback
 */
export function handleGoogleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  const state = params.get('state');
  const error = params.get('error');

  if (error) {
    if (window.opener) {
      window.opener.postMessage({
        type: 'google-auth-error',
        error: error
      }, window.location.origin);
    }
    return;
  }

  if (code && state) {
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
 * Check if we're on OAuth callback page
 */
export function isOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  return params.has('code') && params.has('state');
}