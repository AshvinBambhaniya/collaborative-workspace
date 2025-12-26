import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const createWorkspaceSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
});

export const createProjectSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  workspaceId: z.string().uuid(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['OWNER', 'COLLABORATOR', 'VIEWER']),
});
