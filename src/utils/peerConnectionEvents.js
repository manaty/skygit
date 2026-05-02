export function bindConnectionEvents(connection, handlers = {}) {
  if (handlers.open) {
    connection.on('open', handlers.open);
  }

  if (handlers.data) {
    connection.on('data', handlers.data);
  }

  if (handlers.close) {
    connection.on('close', handlers.close);
  }

  if (handlers.error) {
    connection.on('error', handlers.error);
  }

  return connection;
}

export function bindPeerEvents(peer, handlers = {}) {
  Object.entries(handlers).forEach(([eventName, handler]) => {
    if (handler) {
      peer.on(eventName, handler);
    }
  });

  return peer;
}
