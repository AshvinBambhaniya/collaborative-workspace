import { Request, Response, NextFunction } from 'express';
import * as projectService from '../../services/project.service';
import { createProjectSchema } from '../../utils/validation';

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.params;
    // Inject workspaceId into body for validation if schema requires it, or just pass it
    const validatedData = createProjectSchema.omit({ workspaceId: true }).parse(req.body);
    const project = await projectService.createProject(workspaceId, validatedData);
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workspaceId } = req.params;
    const projects = await projectService.getProjects(workspaceId);
    res.json(projects);
  } catch (error) {
    next(error);
  }
};
