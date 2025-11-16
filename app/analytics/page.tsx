'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { analyticsAPI, projectsAPI } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#e5e5e5', '#c5c5c5', '#a5a5a5', '#858585', '#656565', '#454545'];

interface Project {
  id: number;
  name: string;
  project_type: 'activity' | 'llm';
}

function AnalyticsContent() {
  const searchParams = useSearchParams();
  const projectParam = searchParams.get('project');
  const [selectedProjectId, setSelectedProjectId] = useState<number | undefined>(
    projectParam ? Number(projectParam) : undefined
  );

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

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', selectedProjectId],
    queryFn: async () => {
      const response = await analyticsAPI.get(selectedProjectId);
      return response.data;
    },
    enabled: !!selectedProjectId,
  });

  const selectedProject = projects?.find((p: Project) => p.id === selectedProjectId);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e5e5e5]">Analytics</h1>
          <p className="text-[#a5a5a5] mt-2">View detailed analytics for your projects</p>
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

        {/* View Logs Button */}
        {selectedProjectId && (
          <div className="flex justify-end">
            <a
              href={`/logs?project=${selectedProjectId}`}
              className="px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] font-medium transition-colors inline-flex items-center"
            >
              <span className="mr-2">📝</span>
              View Logs for this Project
            </a>
          </div>
        )}

        {/* Analytics Content */}
        {!selectedProjectId ? (
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-12 text-center">
            <p className="text-[#a5a5a5]">Select a project to view analytics</p>
          </div>
        ) : analyticsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-[#a5a5a5]">Loading analytics...</div>
          </div>
        ) : (
          <>
            {/* Activity Logs Analytics */}
            {selectedProject?.project_type === 'activity' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Event Logs */}
                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-[#e5e5e5] mb-4">Monthly Event Logs</h2>
                  {analytics?.monthly_logs && analytics.monthly_logs.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.monthly_logs}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                        <XAxis dataKey="month" stroke="#a5a5a5" />
                        <YAxis stroke="#a5a5a5" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
                          labelStyle={{ color: '#e5e5e5' }}
                        />
                        <Legend />
                        <Bar dataKey="eventCount" name="Event Logs" fill="#e5e5e5" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-[#a5a5a5]">
                      No data available
                    </div>
                  )}
                </div>

                {/* Log Levels Distribution */}
                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-[#e5e5e5] mb-4">Log Levels Distribution</h2>
                  {analytics?.log_levels && analytics.log_levels.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.log_levels}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                        <XAxis dataKey="level" stroke="#a5a5a5" />
                        <YAxis stroke="#a5a5a5" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
                          labelStyle={{ color: '#e5e5e5' }}
                        />
                        <Bar dataKey="count" fill="#c5c5c5" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-[#a5a5a5]">
                      No data available
                    </div>
                  )}
                </div>

                {/* Total Logs Summary */}
                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 lg:col-span-2">
                  <h2 className="text-lg font-semibold text-[#e5e5e5] mb-4">Summary</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analytics?.log_levels?.map((level: any) => (
                      <div key={level.level} className="text-center">
                        <p className="text-2xl font-bold text-[#e5e5e5]">{level.count}</p>
                        <p className="text-sm text-[#a5a5a5] capitalize">{level.level} Logs</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LLM Logs Analytics */}
            {selectedProject?.project_type === 'llm' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly LLM Logs */}
                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-[#e5e5e5] mb-4">Monthly LLM Logs</h2>
                  {analytics?.monthly_logs && analytics.monthly_logs.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analytics.monthly_logs}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                        <XAxis dataKey="month" stroke="#a5a5a5" />
                        <YAxis stroke="#a5a5a5" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
                          labelStyle={{ color: '#e5e5e5' }}
                        />
                        <Legend />
                        <Bar dataKey="llmCount" name="LLM Logs" fill="#c5c5c5" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-[#a5a5a5]">
                      No data available
                    </div>
                  )}
                </div>

                {/* LLM Sources Distribution */}
                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-[#e5e5e5] mb-4">LLM Sources</h2>
                  {analytics?.llm_sources && analytics.llm_sources.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analytics.llm_sources}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {analytics.llm_sources.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#2a2a2a', border: '1px solid #3a3a3a' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-[#a5a5a5]">
                      No data available
                    </div>
                  )}
                </div>

                {/* LLM Sources Summary */}
                <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 lg:col-span-2">
                  <h2 className="text-lg font-semibold text-[#e5e5e5] mb-4">Sources Summary</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analytics?.llm_sources?.map((source: any) => (
                      <div key={source.name} className="text-center">
                        <p className="text-2xl font-bold text-[#e5e5e5]">{source.value}</p>
                        <p className="text-sm text-[#a5a5a5]">{source.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#a5a5a5]">Loading...</div>
        </div>
      </DashboardLayout>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}