import { Request, Response, NextFunction } from 'express';
import redisClient from '../../config/redis';

const WINDOW_SIZE_IN_SECONDS = 15 * 60; // 15 minutes
const MAX_WINDOW_REQUEST_COUNT = 100;

export const rateLimiter = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const key = `rate_limit:${ip}`;

  try {
    const requests = await redisClient.incr(key);

    if (requests === 1) {
      await redisClient.expire(key, WINDOW_SIZE_IN_SECONDS);
    }

    if (requests > MAX_WINDOW_REQUEST_COUNT) {
      const ttl = await redisClient.ttl(key);
      res.status(429).json({ error: 'Too many requests', retryAfter: ttl });
      return; // Ensure we return here
    }

    next();
  } catch (error) {
    console.error('Rate Limiter Error:', error);
    next(); // Fail open if Redis is down
  }
};
