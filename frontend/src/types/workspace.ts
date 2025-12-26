export interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  members: Array<{
      userId: string;
      role: 'OWNER' | 'COLLABORATOR' | 'VIEWER';
      user?: {
        name: string;
        email: string;
      };
  }>;
}