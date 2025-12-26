import prisma from '../config/prisma';
import { Role } from '@prisma/client';

export const createWorkspace = async (userId: string, data: { name: string; description?: string }) => {
  return await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: userId,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: userId,
        role: Role.OWNER,
      },
    });

    return workspace;
  });
};

export const getWorkspaces = async (userId: string) => {
  return await prisma.workspace.findMany({
    where: {
      members: {
        some: { userId },
      },
    },
    include: {
      members: true,
    },
  });
};

export const getWorkspace = async (workspaceId: string) => {
    return await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } }
    });
};

export const inviteMember = async (workspaceId: string, email: string, role: Role) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const existingMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id } }
    });

    if (existingMember) throw new Error('User already a member');

    return await prisma.workspaceMember.create({
        data: {
            workspaceId,
            userId: user.id,
            role,
        }
    });
};
