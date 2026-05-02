# Security Notes

SkyGit is designed as a serverless client app. That keeps deployment simple, but
it also means credentials are handled in the browser.

## GitHub Personal Access Token

- The GitHub PAT is stored in `localStorage` as `skygit_token`.
- Any script running in the app origin can potentially read that token.
- Users should create a dedicated token with the minimum scopes needed by the
  app, and revoke it from GitHub if the browser or device is no longer trusted.
- A future desktop/mobile wrapper should move token storage to the OS keychain.

## Encrypted Secrets

- Cloud credentials saved in `skygit-config/secrets.json` are encrypted with
  AES-GCM using a key derived from the GitHub token.
- This protects the stored file at rest, but it does not protect secrets from a
  compromised browser session where the token is already available.
- Changing or revoking the GitHub token can make existing encrypted secrets
  undecryptable unless they are re-saved with the new token.

## Cloud Uploads

- Google Drive refresh tokens are exchanged directly from the browser.
- The current S3 recording upload path expects public-write buckets or a
  compatible endpoint. Private S3 buckets should use signed URLs or a backend
  proxy before production use.

## Recommended Hardening

- Add a Content Security Policy for deployed builds.
- Prefer fine-grained GitHub tokens when the required repository permissions are
  fully mapped.
- Avoid entering production cloud credentials until signed upload flows are in
  place.
