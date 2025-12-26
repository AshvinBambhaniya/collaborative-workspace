import { Request, Response, NextFunction } from 'express';
import * as authService from '../../services/auth.service';
import { registerSchema, loginSchema } from '../../utils/validation';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.register(validatedData);
    res.status(201).json(user);
  } catch (error: any) {
    if (error.issues) { // Zod error
        return res.status(400).json({ error: error.issues });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await authService.login(validatedData);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: 'Refresh token required' });
        
        const result = await authService.refresh(refreshToken);
        res.json(result);
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};
