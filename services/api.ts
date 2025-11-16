import axios from '@/lib/axios';

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; password_confirm: string }) =>
    axios.post('/auth/register/', data),

  login: (username: string, password: string) =>
    axios.post('/auth/token/', { username, password }),

  getCurrentUser: () =>
    axios.get('/auth/user/'),

  updateProfile: (data: { username?: string; email?: string; password?: string }) =>
    axios.put('/auth/user/profile/', data),

  googleLogin: () =>
    axios.get('/auth/google/login/'),

  googleCallback: (code: string) =>
    axios.post('/auth/google/callback/', { code }),
};

// Projects API
export const projectsAPI = {
  list: () =>
    axios.get('/projects/'),

  get: (id: number) =>
    axios.get(`/projects/${id}/`),

  create: (data: { name: string; description?: string; project_type: 'activity' | 'llm' }) =>
    axios.post('/projects/', data),

  update: (id: number, data: Partial<{ name: string; description: string; is_active: boolean }>) =>
    axios.patch(`/projects/${id}/`, data),

  delete: (id: number) =>
    axios.delete(`/projects/${id}/`),
};

// API Keys API
export const apiKeysAPI = {
  list: () =>
    axios.get('/api-keys/'),

  get: (id: number) =>
    axios.get(`/api-keys/${id}/`),

  create: (name: string) =>
    axios.post('/api-keys/', { name }),

  update: (id: number, data: { name?: string; is_active?: boolean }) =>
    axios.patch(`/api-keys/${id}/`, data),

  delete: (id: number) =>
    axios.delete(`/api-keys/${id}/`),
};

// Event Logs API
export const eventLogsAPI = {
  list: (projectId?: number) =>
    axios.get('/event-logs/', { params: projectId ? { project: projectId } : {} }),

  get: (id: number) =>
    axios.get(`/event-logs/${id}/`),

  delete: (id: number) =>
    axios.delete(`/event-logs/${id}/`),

  download: (projectId?: number) =>
    axios.get('/event-logs/download/', {
      params: projectId ? { project: projectId } : {},
      responseType: 'blob'
    }),
};

// LLM Logs API
export const llmLogsAPI = {
  list: (projectId?: number) =>
    axios.get('/llm-logs/', { params: projectId ? { project: projectId } : {} }),

  get: (id: number) =>
    axios.get(`/llm-logs/${id}/`),

  delete: (id: number) =>
    axios.delete(`/llm-logs/${id}/`),

  download: (projectId?: number) =>
    axios.get('/llm-logs/download/', {
      params: projectId ? { project: projectId } : {},
      responseType: 'blob'
    }),
};

// Analytics API
export const analyticsAPI = {
  get: (projectId?: number) =>
    axios.get('/analytics/', { params: projectId ? { project_id: projectId } : {} }),

  download: (dataType: string) =>
    axios.get(`/analytics/download/${dataType}/`, { responseType: 'blob' }),
};

// User Stats API
export const userAPI = {
  getStats: () =>
    axios.get('/user/stats/'),

  getNotificationPreferences: () =>
    axios.get('/email-notifications/'),

  updateNotificationPreferences: (data: {
    email?: string;
    enabled?: boolean;
    notify_on_error?: boolean;
    notify_on_warning?: boolean;
  }) =>
    axios.put('/email-notifications/', data),
};

// Bulk Operations API
export const bulkAPI = {
  downloadAllLogs: (projectId?: number) =>
    axios.get('/download/all-logs/', {
      params: projectId ? { project: projectId } : {},
      responseType: 'blob'
    }),

  deleteAllLogs: (projectId?: number) =>
    axios.delete('/delete/all-logs/', {
      params: projectId ? { project: projectId } : {}
    }),
};