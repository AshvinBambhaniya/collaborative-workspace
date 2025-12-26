import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { verifyAccessToken } from './utils/authUtils';

export const initSocket = async (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  const pubClient = createClient({ url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}` });
  const subClient = pubClient.duplicate();

  await Promise.all([pubClient.connect(), subClient.connect()]);

  io.adapter(createAdapter(pubClient, subClient));

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    try {
      const payload = verifyAccessToken(token);
      (socket as any).user = payload;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log(`User connected: ${user.userId}`);

    socket.on('join_project', (projectId: string) => {
      console.log(`User ${user.userId} joined project ${projectId}`);
      socket.join(projectId);
      socket.to(projectId).emit('user_joined', { userId: user.userId });
    });

    socket.on('leave_project', (projectId: string) => {
        socket.leave(projectId);
        socket.to(projectId).emit('user_left', { userId: user.userId });
    });

    socket.on('file_change', (data: { projectId: string; content: string; filePath: string }) => {
      socket.to(data.projectId).emit('file_change', { ...data, userId: user.userId });
    });

    socket.on('cursor_move', (data: { projectId: string; position: any }) => {
        socket.to(data.projectId).emit('cursor_move', { ...data, userId: user.userId });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.userId}`);
    });
  });

  return io;
};
