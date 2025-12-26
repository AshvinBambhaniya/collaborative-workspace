import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/client';
import type { Workspace } from '../types/workspace';
import { Link } from 'react-router-dom';
import { Plus, Folder } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Dashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const { data: workspaces, isLoading } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const res = await api.get('/workspaces');
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      return await api.post('/workspaces', { name });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setIsModalOpen(false);
      setNewWorkspaceName('');
      toast.success('Workspace created');
    },
    onError: () => toast.error('Failed to create workspace'),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newWorkspaceName);
  };

  if (isLoading) return <div className="text-center py-10">Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Your Workspaces</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          New Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {workspaces?.map((workspace) => (
          <Link
            key={workspace.id}
            to={`/workspace/${workspace.id}`}
            className="bg-white overflow-hidden shadow rounded-lg border border-slate-200 hover:border-primary-500 transition-colors"
          >
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                  <Folder className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-slate-500 truncate">
                    Workspace
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-lg font-medium text-slate-900">
                      {workspace.name}
                    </div>
                  </dd>
                </div>
              </div>
              <div className="mt-4">
                  <span className="text-xs text-slate-400">Owner ID: {workspace.ownerId.substring(0,8)}...</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium leading-6 text-slate-900 mb-4">Create New Workspace</h3>
            <form onSubmit={handleCreate}>
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                placeholder="Workspace Name"
                className="block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm mb-4"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
