'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { eventLogsAPI, llmLogsAPI, projectsAPI } from '@/services/api';
import { format } from 'date-fns';

interface EventLog {
  id: number;
  project: number;
  user_id: string;
  message: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  timestamp: string;
  metadata: any;
}

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

interface Project {
  id: number;
  name: string;
  project_type: 'activity' | 'llm';
}

const LEVEL_COLORS = {
  info: 'bg-[#3a3a3a] text-[#e5e5e5]',
  warning: 'bg-[#4a4a2a] text-[#e5e5c5]',
  error: 'bg-[#4a2a2a] text-[#e5c5c5]',
  debug: 'bg-[#2a2a3a] text-[#c5c5e5]',
};

function LogsContent() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const projectParam = searchParams.get('project');
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    projectParam ? Number(projectParam) : undefined
  );
  const [selectedLog, setSelectedLog] = useState<EventLog | LLMLog | null>(null);

  // Update selected project when URL parameter changes
  useEffect(() => {
    if (projectParam) {
      setSelectedProjectId(Number(projectParam));
    }
  }, [projectParam]);

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.list();
      return response.data;
    },
  });

  const selectedProject = projects?.find((p: Project) => p.id === selectedProjectId);

  // Event Logs Query
  const { data: eventLogs, isLoading: eventLogsLoading } = useQuery({
    queryKey: ['event-logs', selectedProjectId],
    queryFn: async () => {
      const response = await eventLogsAPI.list(selectedProjectId);
      return response.data;
    },
    enabled: !!selectedProjectId && selectedProject?.project_type === 'activity',
  });

  // LLM Logs Query
  const { data: llmLogs, isLoading: llmLogsLoading } = useQuery({
    queryKey: ['llm-logs', selectedProjectId],
    queryFn: async () => {
      const response = await llmLogsAPI.list(selectedProjectId);
      return response.data;
    },
    enabled: !!selectedProjectId && selectedProject?.project_type === 'llm',
  });

  const deleteEventMutation = useMutation({
    mutationFn: eventLogsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-logs'] });
    },
  });

  const deleteLLMMutation = useMutation({
    mutationFn: llmLogsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['llm-logs'] });
    },
  });

  const handleDownload = async () => {
    try {
      if (selectedProject?.project_type === 'activity') {
        const response = await eventLogsAPI.download(selectedProjectId);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `event-logs-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (selectedProject?.project_type === 'llm') {
        const response = await llmLogsAPI.download(selectedProjectId);
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `llm-logs-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this log?')) {
      if (selectedProject?.project_type === 'activity') {
        deleteEventMutation.mutate(id);
      } else {
        deleteLLMMutation.mutate(id);
      }
    }
  };

  const isLoading = eventLogsLoading || llmLogsLoading;
  const logs = selectedProject?.project_type === 'activity' ? eventLogs : llmLogs;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#e5e5e5]">Logs</h1>
            <p className="text-[#a5a5a5] mt-2">View and manage your project logs</p>
          </div>
          {selectedProjectId && (
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] font-medium transition-colors"
            >
              Download CSV
            </button>
          )}
        </div>

        {/* Project Selector */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
          <label className="block text-sm font-medium text-[#c5c5c5] mb-2">
            Select a Project
          </label>
          {projectsLoading ? (
            <div className="text-[#a5a5a5]">Loading projects...</div>
          ) : (
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full md:w-96 px-4 py-2 bg-[#1a1a1a] border border-[#3a3a3a] rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#a5a5a5] focus:border-transparent"
            >
              <option value="">Choose a project...</option>
              {projects?.map((project: Project) => (
                <option key={project.id} value={project.id}>
                  {project.name} ({project.project_type})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* View Analytics Button */}
        {selectedProjectId && (
          <div className="flex justify-end">
            <a
              href={`/analytics?project=${selectedProjectId}`}
              className="px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] font-medium transition-colors inline-flex items-center"
            >
              <span className="mr-2">📈</span>
              View Analytics for this Project
            </a>
          </div>
        )}

        {/* Logs Content */}
        {!selectedProjectId ? (
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-12 text-center">
            <p className="text-[#a5a5a5]">Select a project to view logs</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#a5a5a5]">Loading logs...</div>
          </div>
        ) : (
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg overflow-hidden">
            {logs && logs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[#3a3a3a]">
                  <thead className="bg-[#1a1a1a]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#a5a5a5] uppercase tracking-wider">
                        Timestamp
                      </th>
                      {selectedProject?.project_type === 'activity' ? (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a5a5a5] uppercase tracking-wider">
                            Level
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a5a5a5] uppercase tracking-wider">
                            Message
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a5a5a5] uppercase tracking-wider">
                            Source
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-[#a5a5a5] uppercase tracking-wider">
                            Query
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#a5a5a5] uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[#a5a5a5] uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3a3a3a]">
                    {logs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-[#3a3a3a] transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#c5c5c5]">
                          {format(new Date(log.timestamp), 'MMM dd, yyyy HH:mm:ss')}
                        </td>
                        {selectedProject?.project_type === 'activity' ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${LEVEL_COLORS[log.level as keyof typeof LEVEL_COLORS]}`}>
                                {log.level}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#e5e5e5] max-w-md truncate">
                              {log.message}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#3a3a3a] text-[#e5e5e5]">
                                {log.source}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[#e5e5e5] max-w-md truncate">
                              {log.query || 'N/A'}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#a5a5a5]">
                          {log.user_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-[#e5e5e5] hover:text-[#c5c5c5] mr-3 transition-colors"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-[#a5a5a5] hover:text-[#e5e5e5] transition-colors"
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
                <p className="text-[#a5a5a5]">No logs found for this project</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-[#000000] bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-[#e5e5e5]">
                {selectedProject?.project_type === 'activity' ? 'Event Log Details' : 'LLM Log Details'}
              </h2>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-[#a5a5a5] hover:text-[#e5e5e5] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#a5a5a5]">Timestamp</label>
                <p className="mt-1 text-sm text-[#e5e5e5]">
                  {format(new Date(selectedLog.timestamp), 'PPpp')}
                </p>
              </div>

              {'level' in selectedLog && (
                <div>
                  <label className="block text-sm font-medium text-[#a5a5a5]">Level</label>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full ${LEVEL_COLORS[selectedLog.level as keyof typeof LEVEL_COLORS]}`}>
                    {selectedLog.level}
                  </span>
                </div>
              )}

              {'source' in selectedLog && (
                <div>
                  <label className="block text-sm font-medium text-[#a5a5a5]">Source</label>
                  <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-[#3a3a3a] text-[#e5e5e5]">
                    {selectedLog.source}
                  </span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[#a5a5a5]">User ID</label>
                <p className="mt-1 text-sm text-[#e5e5e5]">{selectedLog.user_id}</p>
              </div>

              {'message' in selectedLog && (
                <div>
                  <label className="block text-sm font-medium text-[#a5a5a5]">Message</label>
                  <p className="mt-1 text-sm text-[#e5e5e5] whitespace-pre-wrap bg-[#1a1a1a] border border-[#3a3a3a] p-3 rounded-md">
                    {selectedLog.message}
                  </p>
                </div>
              )}

              {'query' in selectedLog && selectedLog.query && (
                <div>
                  <label className="block text-sm font-medium text-[#a5a5a5]">Query</label>
                  <div className="mt-1 text-sm text-[#e5e5e5] bg-[#1a1a1a] border border-[#3a3a3a] p-4 rounded-md whitespace-pre-wrap">
                    {selectedLog.query}
                  </div>
                </div>
              )}

              {'response' in selectedLog && selectedLog.response && (
                <div>
                  <label className="block text-sm font-medium text-[#a5a5a5]">Response</label>
                  <div className="mt-1 text-sm text-[#e5e5e5] bg-[#1a1a1a] border border-[#3a3a3a] p-4 rounded-md whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {selectedLog.response}
                  </div>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-[#a5a5a5]">Metadata</label>
                  <pre className="mt-1 text-sm text-[#e5e5e5] bg-[#1a1a1a] border border-[#3a3a3a] p-3 rounded-md overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] font-medium transition-colors"
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

export default function LogsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#a5a5a5]">Loading...</div>
        </div>
      </DashboardLayout>
    }>
      <LogsContent />
    </Suspense>
  );
}