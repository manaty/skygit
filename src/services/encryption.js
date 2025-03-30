// Create a crypto key from the GitHub token
export async function deriveKeyFromToken(token) {
    const enc = new TextEncoder();
    const keyData = enc.encode(token);
  
    const hash = await crypto.subtle.digest('SHA-256', keyData);
  
    const key = await crypto.subtle.importKey(
      'raw',
      hash,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );

    return key;
  }
  
  export async function encryptJSON(token, data) {
    const key = await deriveKeyFromToken(token);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encoded = enc.encode(JSON.stringify(data));
  
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoded
    );
  
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
  
    return btoa(String.fromCharCode(...combined));
  }
  
  export async function decryptJSON(token, base64) {
    const combined = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
  
    const key = await deriveKeyFromToken(token);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext
    );
  
    const dec = new TextDecoder();
    const text = dec.decode(decrypted)
    return JSON.parse(text);
  }
  