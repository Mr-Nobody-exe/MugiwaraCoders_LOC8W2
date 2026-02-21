const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join:admin', () => socket.join('admin_room'));
    socket.on('join:event', (eventId) => socket.join(`event:${eventId}`));
    socket.on('disconnect', () => console.log(`❌ Socket disconnected: ${socket.id}`));
  });
};

export default socketHandler;