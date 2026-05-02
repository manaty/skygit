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

export function bindPeerDataConnection(connection, handlers = {}) {
  const peerId = handlers.peerId || connection.peer;
  const username = handlers.username;

  const connectionHandlers = {};

  if (handlers.open) {
    connectionHandlers.open = () => handlers.open(peerId, username);
  }

  if (handlers.data) {
    connectionHandlers.data = (data) => handlers.data(data, peerId, username);
  }

  if (handlers.close) {
    connectionHandlers.close = () => handlers.close(peerId, username);
  }

  if (handlers.error) {
    connectionHandlers.error = (error) => handlers.error(error, peerId, username);
  }

  return bindConnectionEvents(connection, connectionHandlers);
}

export function bindLeaderConnectionEvents(connection, handlers = {}) {
  handlers.log?.('[Discovery] Setting up connection to leader');

  bindConnectionEvents(connection, {
    data: handlers.data,
    close: () => {
      handlers.log?.('[Discovery] Leader connection closed');
      handlers.disconnected?.();
    },
    error: (error) => {
      handlers.warn?.('[Discovery] Leader connection error:', error);
      handlers.disconnected?.(error);
    }
  });

  handlers.register?.(connection);
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
