// src/lib/githubAuth.js
const client_id = 'Ov23liw9jjO79PNctuNV'
const redirect_uri = 'http://localhost:5173/callback'

export function loginWithGitHub() {
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${redirect_uri}&scope=repo%20read:user`
  window.location.href = githubAuthUrl
}
