import { Request, Response, NextFunction } from 'express';
import prisma from '../../config/prisma';
import { Role } from '@prisma/client';

export const requireRole = (allowedRoles: Role[], resourceType: 'workspace' | 'project' = 'workspace') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      let workspaceId = req.params.workspaceId;
      const projectId = req.params.projectId;

      if (resourceType === 'project') {
        if (!projectId) return res.status(400).json({ error: 'Project ID required' });
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return res.status(404).json({ error: 'Project not found' });
        workspaceId = project.workspaceId;
      }

      if (!workspaceId) return res.status(400).json({ error: 'Workspace ID required' });

      const membership = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId,
          },
        },
      });

      if (!membership) return res.status(403).json({ error: 'Access denied' });

      if (!allowedRoles.includes(membership.role)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      (req as any).workspaceId = workspaceId; // Pass context
      next();
    } catch (error) {
      console.error('RBAC Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
