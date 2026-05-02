export function connectPeerWithTimeout(peer, peerId, metadata, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const conn = peer.connect(peerId, { metadata });
    let settled = false;

    const settle = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback();
    };

    const timer = setTimeout(() => {
      settle(() => {
        conn.close();
        reject(new Error('Connection timeout'));
      });
    }, timeout);

    conn.on('open', () => {
      settle(() => resolve(conn));
    });

    conn.on('error', (error) => {
      settle(() => reject(error));
    });
  });
}
