import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../utils/authUtils';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    (req as any).user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};
