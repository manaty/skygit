export const GOOGLE_DRIVE_SETUP_STEPS = [1, 2, 3, 4, 5, 6, 7, 8];
export const GOOGLE_DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const GOOGLE_OAUTH_PLAYGROUND_URL = 'https://developers.google.com/oauthplayground';

export function createInitialGoogleDriveCredentials() {
  return {
    client_id: '',
    client_secret: '',
    refresh_token: '',
    folder_url: ''
  };
}

export function getSuggestedGoogleDriveFolderName(auth) {
  const username = auth?.user?.login || 'user';
  return `SkyGit-${username}`;
}

export function getAppBaseUrl(location) {
  const { protocol, hostname, port } = location;
  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
}

export function buildGoogleDriveAuthorizationUrl({ clientId, redirectUri }) {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_DRIVE_SCOPE,
    access_type: 'offline',
    prompt: 'consent'
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function buildGoogleDriveTokenExchangeScript({
  clientId = 'YOUR_CLIENT_ID',
  clientSecret = 'YOUR_CLIENT_SECRET',
  authorizationCode = 'YOUR_AUTH_CODE'
} = {}) {
  return `import requests

CLIENT_ID = "${clientId || 'YOUR_CLIENT_ID'}"
CLIENT_SECRET = "${clientSecret || 'YOUR_CLIENT_SECRET'}"
AUTH_CODE = "${authorizationCode || 'YOUR_AUTH_CODE'}"

response = requests.post('https://oauth2.googleapis.com/token', data={
    'code': AUTH_CODE,
    'client_id': CLIENT_ID,
    'client_secret': CLIENT_SECRET,
    'redirect_uri': 'http://localhost',
    'grant_type': 'authorization_code'
})

print(response.json())`;
}

export function isGoogleDriveSetupComplete(credentials) {
  return Boolean(
    credentials.client_id &&
    credentials.client_secret &&
    credentials.refresh_token &&
    credentials.folder_url
  );
}
