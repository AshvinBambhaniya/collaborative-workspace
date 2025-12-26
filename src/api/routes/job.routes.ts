import { Router } from 'express';
import * as jobController from '../controllers/job.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Asynchronous job processing API
 */

/**
 * @swagger
 * /api/jobs:
 *   post:
 *     summary: Submit a new code execution job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               language:
 *                 type: string
 *               code:
 *                 type: string
 *     responses:
 *       202:
 *         description: Job accepted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId:
 *                   type: string
 *                 status:
 *                   type: string
 */
router.post('/', jobController.submitJob);

/**
 * @swagger
 * /api/jobs/{jobId}:
 *   get:
 *     summary: Get job status and result
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: jobId
 *         schema:
 *           type: string
 *         required: true
 *         description: The Job ID
 *     responses:
 *       200:
 *         description: Job details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 jobId:
 *                   type: string
 *                 status:
 *                   type: string
 *                   enum: [pending, completed, failed]
 *                 result:
 *                   type: object
 *                 error:
 *                   type: string
 */
router.get('/:jobId', jobController.getJobStatus);

export default router;
