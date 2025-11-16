'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { userAPI, projectsAPI } from '@/services/api';

export default function DashboardPage() {
  const [activeEventTab, setActiveEventTab] = useState<'dataidea' | 'python' | 'javascript'>('dataidea');
  const [activeLLMTab, setActiveLLMTab] = useState<'dataidea' | 'python' | 'javascript'>('dataidea');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await userAPI.getStats();
      return response.data;
    },
  });

  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectsAPI.list();
      return response.data;
    },
  });

  if (statsLoading || projectsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-[#a5a5a5]">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e5e5e5]">Dashboard</h1>
          <p className="text-[#a5a5a5] mt-2">Overview of your logging activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#a5a5a5]">Total Event Logs</p>
                <p className="text-2xl font-semibold text-[#e5e5e5]">{stats?.total_event_logs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🤖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#a5a5a5]">Total LLM Logs</p>
                <p className="text-2xl font-semibold text-[#e5e5e5]">{stats?.total_llm_logs || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📁</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#a5a5a5]">Active Projects</p>
                <p className="text-2xl font-semibold text-[#e5e5e5]">{projects?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🔑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[#a5a5a5]">API Keys</p>
                <p className="text-2xl font-semibold text-[#e5e5e5]">{stats?.api_keys_count || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[#e5e5e5]">Recent Projects</h2>
            <Link href="/projects" className="text-sm text-[#a5a5a5] hover:text-[#e5e5e5]">
              View all →
            </Link>
          </div>
          {projects && projects.length > 0 ? (
            <div className="space-y-3">
              {projects.slice(0, 5).map((project: any) => (
                <Link
                  key={project.id}
                  href={`/analytics?project=${project.id}`}
                  className="flex items-center justify-between py-3 px-4 border border-[#3a3a3a] rounded-md hover:bg-[#3a3a3a] transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-[#e5e5e5]">{project.name}</p>
                    <p className="text-xs text-[#a5a5a5] capitalize">{project.project_type} project</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#e5e5e5]">{project.log_count || 0}</p>
                    <p className="text-xs text-[#a5a5a5]">total logs</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#a5a5a5]">
              No projects yet. <Link href="/projects" className="text-[#e5e5e5] hover:underline">Create one</Link> to get started!
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/analytics" className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors">
            <div className="flex items-center">
              <span className="text-3xl mr-4">📈</span>
              <div>
                <h3 className="font-semibold text-[#e5e5e5]">View Analytics</h3>
                <p className="text-sm text-[#a5a5a5]">Detailed project insights</p>
              </div>
            </div>
          </Link>

          <Link href="/projects" className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors">
            <div className="flex items-center">
              <span className="text-3xl mr-4">📁</span>
              <div>
                <h3 className="font-semibold text-[#e5e5e5]">Manage Projects</h3>
                <p className="text-sm text-[#a5a5a5]">Create and organize</p>
              </div>
            </div>
          </Link>

          <Link href="/api-keys" className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6 hover:bg-[#3a3a3a] transition-colors">
            <div className="flex items-center">
              <span className="text-3xl mr-4">🔑</span>
              <div>
                <h3 className="font-semibold text-[#e5e5e5]">API Keys</h3>
                <p className="text-sm text-[#a5a5a5]">Generate new keys</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Integration Guide */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-[#e5e5e5]">How to Send Logs</h2>
          <p className="text-sm text-[#a5a5a5]">
            Integrate logging into your application using one of these methods.{' '}
            <strong className="text-[#e5e5e5]">Note:</strong> Make sure to create an API key from the{' '}
            <Link href="/api-keys" className="text-[#e5e5e5] hover:underline">API Keys</Link> page first.
          </p>

          {/* Event/Activity Logs Section */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#e5e5e5] mb-4">Event / Activity Logs</h3>

            {/* Event Tabs */}
            <div className="flex space-x-2 mb-4 border-b border-[#3a3a3a]">
              <button
                onClick={() => setActiveEventTab('dataidea')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeEventTab === 'dataidea'
                    ? 'text-[#e5e5e5] border-b-2 border-[#e5e5e5]'
                    : 'text-[#a5a5a5] hover:text-[#c5c5c5]'
                }`}
              >
                DATAIDEA Python Package
              </button>
              <button
                onClick={() => setActiveEventTab('python')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeEventTab === 'python'
                    ? 'text-[#e5e5e5] border-b-2 border-[#e5e5e5]'
                    : 'text-[#a5a5a5] hover:text-[#c5c5c5]'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveEventTab('javascript')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeEventTab === 'javascript'
                    ? 'text-[#e5e5e5] border-b-2 border-[#e5e5e5]'
                    : 'text-[#a5a5a5] hover:text-[#c5c5c5]'
                }`}
              >
                JavaScript
              </button>
            </div>

            {/* Event Code Examples */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4 overflow-x-auto">
              {activeEventTab === 'dataidea' && (
                <pre className="text-sm text-[#e5e5e5]">
                  <code>{`import os

api_key = os.getenv('DATAIDEA_API_KEY')

from dataidea import event_log

event_log({
    'api_key': api_key,
    'project_name': 'Test Project',
    'user_id': '1234567890',  # optional
    'message': 'This is a test message',
    'level': 'info',  # info, warning, error, debug
    'metadata': {'test': 'test'}  # optional
})`}</code>
                </pre>
              )}

              {activeEventTab === 'python' && (
                <pre className="text-sm text-[#e5e5e5]">
                  <code>{`import requests
import os

api_key = os.getenv('DATAIDEA_API_KEY')

response = requests.post(
    'https://logger.api.dataidea.org/api/event-logs/',
    headers={'Authorization': f'Api-Key {api_key}'},
    json={
        'project_name': 'Test Project',
        'user_id': '1234567890',  # optional
        'message': 'This is a test message',
        'level': 'info',  # info, warning, error, debug
        'metadata': {'test': 'test'}  # optional
    }
)`}</code>
                </pre>
              )}

              {activeEventTab === 'javascript' && (
                <pre className="text-sm text-[#e5e5e5]">
                  <code>{`const apiKey = process.env.DATAIDEA_API_KEY;

const response = await fetch(
  'https://logger.api.dataidea.org/api/event-logs/',
  {
    method: 'POST',
    headers: {
      'Authorization': \`Api-Key \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project_name: 'Test Project',
      user_id: '1234567890',  // optional
      message: 'This is a test message',
      level: 'info',  // info, warning, error, debug
      metadata: { test: 'test' }  // optional
    })
  }
);`}</code>
                </pre>
              )}
            </div>

            <div className="mt-3 text-sm text-[#a5a5a5]">
              <strong className="text-[#e5e5e5]">Log Levels:</strong> info, warning, error, debug
            </div>
          </div>

          {/* LLM Logs Section */}
          <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#e5e5e5] mb-4">LLM Logs</h3>

            {/* LLM Tabs */}
            <div className="flex space-x-2 mb-4 border-b border-[#3a3a3a]">
              <button
                onClick={() => setActiveLLMTab('dataidea')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeLLMTab === 'dataidea'
                    ? 'text-[#e5e5e5] border-b-2 border-[#e5e5e5]'
                    : 'text-[#a5a5a5] hover:text-[#c5c5c5]'
                }`}
              >
                DATAIDEA Python Package
              </button>
              <button
                onClick={() => setActiveLLMTab('python')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeLLMTab === 'python'
                    ? 'text-[#e5e5e5] border-b-2 border-[#e5e5e5]'
                    : 'text-[#a5a5a5] hover:text-[#c5c5c5]'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setActiveLLMTab('javascript')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  activeLLMTab === 'javascript'
                    ? 'text-[#e5e5e5] border-b-2 border-[#e5e5e5]'
                    : 'text-[#a5a5a5] hover:text-[#c5c5c5]'
                }`}
              >
                JavaScript
              </button>
            </div>

            {/* LLM Code Examples */}
            <div className="bg-[#1a1a1a] border border-[#3a3a3a] rounded-md p-4 overflow-x-auto">
              {activeLLMTab === 'dataidea' && (
                <pre className="text-sm text-[#e5e5e5]">
                  <code>{`import os

api_key = os.getenv('DATAIDEA_API_KEY')

from dataidea import llm_log

llm_log({
    'api_key': api_key,
    'project_name': 'Test Project',
    'user_id': '1234567890',  # optional
    'source': 'gpt-4o',
    'query': 'This is a test query',
    'response': 'This is a test response',
    'metadata': {'extra': 'extra info'}  # optional
})`}</code>
                </pre>
              )}

              {activeLLMTab === 'python' && (
                <pre className="text-sm text-[#e5e5e5]">
                  <code>{`import requests
import os

api_key = os.getenv('DATAIDEA_API_KEY')

response = requests.post(
    'https://logger.api.dataidea.org/api/llm-logs/',
    headers={'Authorization': f'Api-Key {api_key}'},
    json={
        'project_name': 'Test Project',
        'user_id': '1234567890',  # optional
        'source': 'gpt-4o',
        'query': 'This is a test query',
        'response': 'This is a test response',
        'metadata': {'extra': 'extra info'}  # optional
    }
)`}</code>
                </pre>
              )}

              {activeLLMTab === 'javascript' && (
                <pre className="text-sm text-[#e5e5e5]">
                  <code>{`const apiKey = process.env.DATAIDEA_API_KEY;

const response = await fetch(
  'https://logger.api.dataidea.org/api/llm-logs/',
  {
    method: 'POST',
    headers: {
      'Authorization': \`Api-Key \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      project_name: 'Test Project',
      user_id: '1234567890',  // optional
      source: 'gpt-4o',
      query: 'This is a test query',
      response: 'This is a test response',
      metadata: { extra: 'extra info' }  // optional
    })
  }
);`}</code>
                </pre>
              )}
            </div>

            <div className="mt-3 text-sm text-[#a5a5a5]">
              <strong className="text-[#e5e5e5]">Common Sources:</strong> gpt-4o, gpt-4, claude-3, gemini, etc.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}