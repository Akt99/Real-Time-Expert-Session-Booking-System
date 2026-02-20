let io;

export const initSocket = (server) => {
  io = server;
  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized.');
  }
  return io;
};
