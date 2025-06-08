import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'
import { isOAuthCallback, handleGoogleAuthCallback } from './services/googleOAuth.js'

// Check if this is an OAuth callback
let app;
if (isOAuthCallback()) {
  // Handle the OAuth callback
  handleGoogleAuthCallback();
  // Show a simple message while the popup communicates with parent
  document.getElementById('app').innerHTML = '<div style="padding: 2rem; text-align: center;">Completing Google authentication...</div>';
} else {
  // Normal app initialization
  app = mount(App, {
    target: document.getElementById('app'),
  })
}

// Register service-worker at runtime pointing to the correct base-prefixed file.
// Using import.meta.env.BASE_URL ensures the path resolves to `/sw.js` in dev
// and to the sub-folder (e.g. `/skygit/sw.js`) in production builds when the
// `base` option is configured in `vite.config.js`.
// Register the PWA service-worker only for production builds. During
// `vite dev` the file `/sw.js` is not generated which causes the dev
// server to respond with `index.html` (MIME text/html) and the browser
// to reject the registration attempt.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  const swUrl = `${import.meta.env.BASE_URL}sw.js`;
  navigator.serviceWorker.register(swUrl, {
    scope: import.meta.env.BASE_URL,
  });
}

export default app