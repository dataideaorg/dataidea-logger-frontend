'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { apiKeysAPI } from '@/services/api';
import { format } from 'date-fns';

interface ApiKey {
  id: number;
  key: string;
  name: string;
  created_at: string;
  is_active: boolean;
}

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  const { data: apiKeys, isLoading } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const response = await apiKeysAPI.list();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: apiKeysAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setShowModal(false);
      setNewKeyName('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiKeysAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: apiKeysAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(newKeyName);
  };

  const handleToggleActive = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, data: { is_active: !isActive } });
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this API key?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#e5e5e5]">API Keys</h1>
            <p className="text-[#a5a5a5] mt-2">Manage your API keys for logging</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] font-medium transition-colors"
          >
            Create API Key
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#a5a5a5]">Loading...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {apiKeys?.map((apiKey: ApiKey) => (
              <div key={apiKey.id} className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#e5e5e5]">{apiKey.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        apiKey.is_active ? 'bg-[#e5e5e5] text-[#1a1a1a]' : 'bg-[#2a2a2a] text-[#a5a5a5]'
                      }`}>
                        {apiKey.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <code className="text-sm text-[#c5c5c5] bg-[#1a1a1a] border border-[#3a3a3a] px-3 py-1 rounded font-mono">
                        {apiKey.key}
                      </code>
                      <button
                        onClick={() => handleCopy(apiKey.key)}
                        className="px-3 py-1 text-xs bg-[#2a2a2a] text-[#e5e5e5] rounded hover:bg-[#3a3a3a] transition-colors"
                      >
                        {copiedKey === apiKey.key ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <p className="text-sm text-[#a5a5a5]">
                      Created: {format(new Date(apiKey.created_at), 'PPpp')}
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleActive(apiKey.id, apiKey.is_active)}
                      className="px-3 py-2 text-sm bg-[#2a2a2a] text-[#e5e5e5] rounded-md hover:bg-[#3a3a3a] transition-colors"
                    >
                      {apiKey.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(apiKey.id)}
                      className="px-3 py-2 text-sm bg-[#1a1a1a] border border-[#3a3a3a] text-[#e5e5e5] rounded-md hover:border-gray-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && apiKeys?.length === 0 && (
          <div className="text-center py-12 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg">
            <p className="text-[#a5a5a5]">No API keys yet. Create your first API key to get started!</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-[#1a1a1a] bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#e5e5e5] mb-4">Create API Key</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="My API Key"
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setNewKeyName('');
                  }}
                  className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-gray-700 text-[#e5e5e5] rounded-md hover:border-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] disabled:opacity-50 font-medium transition-colors"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}