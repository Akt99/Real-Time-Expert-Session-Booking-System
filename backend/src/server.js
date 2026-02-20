import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './utils/socket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || '*'
    }
  });

  initSocket(io);

  io.on('connection', (socket) => {
    socket.on('join_expert_room', (expertId) => {
      socket.join(`expert:${expertId}`);
    });

    socket.on('leave_expert_room', (expertId) => {
      socket.leave(`expert:${expertId}`);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
