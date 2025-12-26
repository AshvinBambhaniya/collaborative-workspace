import prisma from '../config/prisma';

export const createProject = async (workspaceId: string, data: { name: string; description?: string }) => {
  return await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      workspaceId,
    },
  });
};

export const getProjects = async (workspaceId: string) => {
  return await prisma.project.findMany({
    where: { workspaceId },
  });
};

export const getProject = async (projectId: string) => {
  return await prisma.project.findUnique({
    where: { id: projectId },
  });
};
