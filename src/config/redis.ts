import { createClient } from 'redis';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err: any) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        console.log('Redis Client Connected');
    } catch (error) {
        console.error('Could not connect to Redis', error);
    }
};

export default redisClient;
