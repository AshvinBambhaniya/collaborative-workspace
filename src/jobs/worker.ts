import { Worker, Job } from 'bullmq';
import JobLog from '../models/JobLog';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

export const initWorker = () => {
  const worker = new Worker('code-execution', async (job: Job) => {
    console.log(`Processing job ${job.id}`);
    
    // Update status to processing (optional, but good for UX)
    // await JobLog.findOneAndUpdate({ jobId: job.id }, { status: 'processing' });

    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Simulate random failure
    if (Math.random() < 0.2) {
      throw new Error('Random simulated failure');
    }

    return { output: 'Code executed successfully', logs: ['Build started...', 'Compiling...', 'Done.'] };
  }, { connection });

  worker.on('completed', async (job: Job, result: any) => {
    console.log(`Job ${job.id} completed`);
    await JobLog.findOneAndUpdate({ jobId: job.id }, { status: 'completed', result });
  });

  worker.on('failed', async (job: Job | undefined, err: Error) => {
    console.log(`Job ${job?.id} failed: ${err.message}`);
    if (job) {
        await JobLog.findOneAndUpdate({ jobId: job.id }, { status: 'failed', error: err.message });
    }
  });

  console.log('Worker started');
};
