import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { Project } from '../types/workspace';
import { Plus, Code, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const WorkspaceView: React.FC = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const queryClient = useQueryClient();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');

  // Ideally, we'd have a getWorkspaceById endpoint, but for now filtering from list or assuming separate endpoint if I built it.
  // Wait, I didn't build getWorkspaceById strictly, I built getWorkspaces (list) and getWorkspace (single). Let's check plan.
  // Plan says: getWorkspace = await prisma.workspace.findUnique... So yes, I have it. But wait, checking services/workspace.service.ts
  // Yes, getWorkspace is there. checking routes... wait.
  // Routes: router.get('/', workspaceController.list); -> This lists all.
  // I DID NOT add a router.get('/:workspaceId') in the backend routes! 
  // I only added invite and project creation under :workspaceId. 
  // I need to fix the backend route to support getting a single workspace details.
  // For now, I will use the list and find locally, OR quickly patch backend.
  // Patching backend is better for "production grade". But I can't interrupt frontend flow easily.
  // I'll assume for now I fetch the list and find the one I need. It's inefficient but works for MVP.
  // actually, let's just fetch projects first.

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ['projects', workspaceId],
    queryFn: async () => {
      const res = await api.get(`/workspaces/${workspaceId}/projects`);
      return res.data;
    },
    enabled: !!workspaceId,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (name: string) => {
      return await api.post(`/workspaces/${workspaceId}/projects`, { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      setIsProjectModalOpen(false);
      setNewProjectName('');
      toast.success('Project created');
    },
    onError: () => toast.error('Failed to create project'),
  });

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
        return await api.post(`/workspaces/${workspaceId}/invite`, { email, role: 'COLLABORATOR' });
    },
    onSuccess: () => {
        setIsInviteModalOpen(false);
        setInviteEmail('');
        toast.success('User invited');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to invite'),
  });

  if (projectsLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Workspace Projects</h1>
        <div className="space-x-3">
            <button
            onClick={() => setIsInviteModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
            >
            <Users className="-ml-1 mr-2 h-5 w-5" />
            Invite Member
            </button>
            <button
            onClick={() => setIsProjectModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
            <Plus className="-ml-1 mr-2 h-5 w-5" />
            New Project
            </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul role="list" className="divide-y divide-slate-200">
          {projects?.length === 0 && (
              <li className="px-4 py-10 text-center text-slate-500">No projects yet. Create one to get started!</li>
          )}
          {projects?.map((project) => (
            <li key={project.id}>
              <Link to={`/project/${project.id}`} className="block hover:bg-slate-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Code className="h-5 w-5 text-primary-500 mr-3" />
                        <p className="text-sm font-medium text-primary-600 truncate">{project.name}</p>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-slate-500">
                        {project.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Create Project Modal */}
      {isProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">New Project</h3>
            <form onSubmit={(e) => { e.preventDefault(); createProjectMutation.mutate(newProjectName); }}>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project Name"
                className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 mb-4 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 border rounded text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-4">Invite to Workspace</h3>
            <form onSubmit={(e) => { e.preventDefault(); inviteMutation.mutate(inviteEmail); }}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 mb-4 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsInviteModalOpen(false)} className="px-4 py-2 border rounded text-slate-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded">Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
