import { codeExecutionQueue } from '../jobs/queue';
import JobLog from '../models/JobLog';

export const createJob = async (data: any) => {
  const job = await codeExecutionQueue.add('execute-code', data, {
    attempts: 3, // Retry logic
    backoff: { type: 'exponential', delay: 1000 },
  });

  // Persist initial status
  await JobLog.create({
    jobId: job.id,
    status: 'pending',
  });

  return { jobId: job.id, status: 'pending' };
};

export const getJobStatus = async (jobId: string) => {
  const jobLog = await JobLog.findOne({ jobId });
  if (!jobLog) throw new Error('Job not found');
  return jobLog;
};
