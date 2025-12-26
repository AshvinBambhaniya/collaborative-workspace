import { Router } from 'express';
import * as workspaceController from '../controllers/workspace.controller';
import * as projectController from '../controllers/project.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Workspaces
 *     description: Workspace management API
 *   - name: Projects
 *     description: Project management API
 */

/**
 * @swagger
 * /api/workspaces:
 *   post:
 *     summary: Create a new workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Workspace created
 */
router.post('/', workspaceController.create);

/**
 * @swagger
 * /api/workspaces:
 *   get:
 *     summary: List all workspaces for the authenticated user
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 */
router.get('/', workspaceController.list);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/invite:
 *   post:
 *     summary: Invite a user to a workspace
 *     tags: [Workspaces]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [OWNER, COLLABORATOR, VIEWER]
 *     responses:
 *       200:
 *         description: User invited successfully
 *       403:
 *         description: Only owners can invite
 */
router.post('/:workspaceId/invite', requireRole([Role.OWNER]), workspaceController.invite);

// Project Routes (Nested)

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects:
 *   post:
 *     summary: Create a new project in a workspace
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The workspace ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created
 */
router.post('/:workspaceId/projects', requireRole([Role.OWNER, Role.COLLABORATOR]), projectController.create);

/**
 * @swagger
 * /api/workspaces/{workspaceId}/projects:
 *   get:
 *     summary: List projects in a workspace
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         schema:
 *           type: string
 *         required: true
 *         description: The workspace ID
 *     responses:
 *       200:
 *         description: List of projects
 */
router.get('/:workspaceId/projects', requireRole([Role.OWNER, Role.COLLABORATOR, Role.VIEWER]), projectController.list);

export default router;
