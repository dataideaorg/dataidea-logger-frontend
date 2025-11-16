'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { llmLogsAPI, projectsAPI } from '@/services/api';
import { format } from 'date-fns';

interface LLMLog {
  id: number;
  project: number;
  user_id: string;
  source: string;
  query: string;
  response: string;
  timestamp: string;
  metadata: any;
}

export default function LLMLogsPage() {
  const queryClient = useQueryClient();
  const [selectedProject, setSelectedProject] = useState<number | undefined>();
  const [selectedLog, setSelectedLog] = useState<LLMLog | null>(null);

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.list();
      return response.data;
    },
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ['llm-logs', selectedProject],
    queryFn: async () => {
      const response = await llmLogsAPI.list(selectedProject);
      return response.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: llmLogsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-logs'] });
    },
  });

  const handleDownload = async () => {
    try {
      const response = await llmLogsAPI.download(selectedProject);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `llm-logs-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this log?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">LLM Logs</h1>
            <p className="text-gray-400 mt-2">View and manage your AI model interaction logs</p>
          </div>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 font-medium transition-colors"
          >
            Download CSV
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-300">Filter by Project:</label>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : undefined)}
              className="px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
            >
              <option value="">All Projects</option>
              {projects?.map((project: any) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-gray-400">Loading...</div>
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-black">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Query
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {logs.map((log: LLMLog) => (
                    <tr key={log.id} className="hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-white">
                          {log.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-white max-w-md truncate">
                        {log.query || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {log.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="text-white hover:text-gray-300 mr-3 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-gray-400 hover:text-white transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-400">No LLM logs found</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">LLM Log Details</h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400">Timestamp</label>
                <p className="mt-1 text-sm text-white">
                  {format(new Date(selectedLog.timestamp), 'PPpp')}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">Source</label>
                <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-700 text-white">
                  {selectedLog.source}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400">User ID</label>
                <p className="mt-1 text-sm text-white">{selectedLog.user_id}</p>
              </div>

              {selectedLog.query && (
                <div>
                  <label className="block text-sm font-medium text-gray-400">Query</label>
                  <div className="mt-1 text-sm text-white bg-black border border-gray-800 p-4 rounded-md whitespace-pre-wrap">
                    {selectedLog.query}
                  </div>
                </div>
              )}

              {selectedLog.response && (
                <div>
                  <label className="block text-sm font-medium text-gray-400">Response</label>
                  <div className="mt-1 text-sm text-white bg-black border border-gray-800 p-4 rounded-md whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {selectedLog.response}
                  </div>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-400">Metadata</label>
                  <pre className="mt-1 text-sm text-white bg-black border border-gray-800 p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}