'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { projectsAPI } from '@/services/api';

interface Project {
  id: number;
  name: string;
  description: string;
  project_type: 'activity' | 'llm';
  created_at: string;
  is_active: boolean;
  event_log_count?: number;
  llm_log_count?: number;
  log_count?: number;
}

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_type: 'activity' as 'activity' | 'llm',
  });

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.list();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: projectsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      projectsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setShowModal(false);
      setEditingProject(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: projectsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      project_type: 'activity',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProject) {
      updateMutation.mutate({
        id: editingProject.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      project_type: project.project_type,
    });
    setShowModal(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#e5e5e5]">Projects</h1>
            <p className="text-[#a5a5a5] mt-2">Manage your logging projects</p>
          </div>
          <button
            onClick={() => {
              setEditingProject(null);
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] font-medium transition-colors"
          >
            Create Project
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#a5a5a5]">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project: Project) => (
              <div key={project.id} className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#e5e5e5]">{project.name}</h3>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-[#2a2a2a] text-[#c5c5c5]">
                      {project.project_type}
                    </span>
                  </div>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    project.is_active ? 'bg-[#e5e5e5] text-[#1a1a1a]' : 'bg-[#2a2a2a] text-[#a5a5a5]'
                  }`}>
                    {project.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {project.description && (
                  <p className="text-sm text-[#a5a5a5] mb-4">{project.description}</p>
                )}

                <div className="space-y-2 mb-4 border-t border-[#3a3a3a] pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a5a5a5]">Event Logs:</span>
                    <span className="font-medium text-[#e5e5e5]">{project.event_log_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#a5a5a5]">LLM Logs:</span>
                    <span className="font-medium text-[#e5e5e5]">{project.llm_log_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-[#3a3a3a] pt-2">
                    <span className="text-[#a5a5a5]">Total Logs:</span>
                    <span className="font-semibold text-[#e5e5e5]">{project.log_count || 0}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 px-3 py-2 text-sm bg-[#2a2a2a] text-[#e5e5e5] rounded-md hover:bg-[#3a3a3a] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="flex-1 px-3 py-2 text-sm bg-[#1a1a1a] border border-[#3a3a3a] text-[#e5e5e5] rounded-md hover:border-gray-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && projects?.length === 0 && (
          <div className="text-center py-12 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg">
            <p className="text-[#a5a5a5]">No projects yet. Create your first project to get started!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1a1a1a] bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#e5e5e5] mb-4">
              {editingProject ? 'Edit Project' : 'Create Project'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                  Type
                </label>
                <select
                  value={formData.project_type}
                  onChange={(e) => setFormData({ ...formData, project_type: e.target.value as 'activity' | 'llm' })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                >
                  <option value="activity">Activity</option>
                  <option value="llm">LLM</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 text-[#e5e5e5] rounded-md hover:border-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] disabled:opacity-50 font-medium transition-colors"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}