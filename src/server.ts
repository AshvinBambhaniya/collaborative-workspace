import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import http from 'http';
import { connectMongoDB } from './config/database';
import { connectRedis } from './config/redis';
import { initSocket } from './socket';
import { initWorker } from './jobs/worker';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectMongoDB();
  await connectRedis();

  initWorker();

  const server = http.createServer(app);
  await initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
