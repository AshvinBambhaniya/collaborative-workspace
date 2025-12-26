import { Request, Response, NextFunction } from 'express';
import * as workspaceService from '../../services/workspace.service';
import { createWorkspaceSchema, inviteMemberSchema } from '../../utils/validation';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const validatedData = createWorkspaceSchema.parse(req.body);
    const workspace = await workspaceService.createWorkspace(userId, validatedData);
    res.status(201).json(workspace);
  } catch (error: any) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.userId;
    const workspaces = await workspaceService.getWorkspaces(userId);
    res.json(workspaces);
  } catch (error) {
    next(error);
  }
};

export const invite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.params;
    const validatedData = inviteMemberSchema.parse(req.body);
    const member = await workspaceService.inviteMember(workspaceId, validatedData.email, validatedData.role as any);
    res.json(member);
  } catch (error) {
    next(error);
  }
};
