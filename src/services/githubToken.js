export async function validateToken(token) {
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` }
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  }
  
  export function saveToken(token) {
    localStorage.setItem('skygit_token', token);
  }
  
  export function loadStoredToken() {
    return localStorage.getItem('skygit_token');
  }
  
  export function clearToken() {
    localStorage.removeItem('skygit_token');
  }