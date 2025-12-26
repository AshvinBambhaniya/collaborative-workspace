import { Request, Response, NextFunction } from 'express';
import * as jobService from '../../services/job.service';

export const submitJob = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const job = await jobService.createJob(req.body);
    res.status(202).json(job);
  } catch (error) {
    next(error);
  }
};

export const getJobStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const job = await jobService.getJobStatus(jobId);
    res.json(job);
  } catch (error) {
    res.status(404).json({ error: 'Job not found' });
  }
};
