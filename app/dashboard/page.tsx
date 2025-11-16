'use client';

import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { analyticsAPI, userAPI } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#ffffff', '#9ca3af', '#6b7280', '#4b5563', '#374151', '#1f2937'];

export default function DashboardPage() {
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await analyticsAPI.get();
      return response.data;
    },
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await userAPI.getStats();
      return response.data;
    },
  });

  if (analyticsLoading || statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  const monthlyData = analytics?.monthly_logs || [];
  const llmSources = analytics?.llm_sources || [];
  const logLevels = analytics?.log_levels || [];
  const projects = analytics?.projects || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-2">Overview of your logging activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Event Logs</p>
                <p className="text-2xl font-semibold text-white">{stats?.total_event_logs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🤖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total LLM Logs</p>
                <p className="text-2xl font-semibold text-white">{stats?.total_llm_logs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📁</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Projects</p>
                <p className="text-2xl font-semibold text-white">{stats?.total_projects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🔑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">API Keys</p>
                <p className="text-2xl font-semibold text-white">{stats?.total_api_keys || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Logs Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Monthly Logs</h2>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Legend />
                  <Bar dataKey="eventCount" name="Event Logs" fill="#ffffff" />
                  <Bar dataKey="llmCount" name="LLM Logs" fill="#6b7280" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* LLM Sources Pie Chart */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">LLM Sources</h2>
            {llmSources.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={llmSources}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {llmSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No LLM logs yet
              </div>
            )}
          </div>

          {/* Log Levels */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Log Levels</h2>
            {logLevels.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={logLevels}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="level" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                    labelStyle={{ color: '#ffffff' }}
                  />
                  <Bar dataKey="count" fill="#9ca3af" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No data available
              </div>
            )}
          </div>

          {/* Top Projects */}
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Top Projects</h2>
            {projects.length > 0 ? (
              <div className="space-y-3">
                {projects.slice(0, 5).map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                    <span className="text-sm font-medium text-white">{project.name}</span>
                    <span className="text-sm text-gray-400">{project.count} logs</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                No projects yet
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}