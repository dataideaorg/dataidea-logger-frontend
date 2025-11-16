'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import { userAPI, authAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { user, setAuth } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Profile form
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    confirmPassword: '',
  });

  // Notification preferences
  const { data: notificationPrefs, isLoading: prefsLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const response = await userAPI.getNotificationPreferences();
      return response.data;
    },
  });

  const [notificationData, setNotificationData] = useState({
    email: notificationPrefs?.email || '',
    enabled: notificationPrefs?.enabled ?? true,
    notify_on_error: notificationPrefs?.notify_on_error ?? true,
    notify_on_warning: notificationPrefs?.notify_on_warning ?? false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: async (response) => {
      // Update auth store with new user data
      const userResponse = await authAPI.getCurrentUser();
      const updatedUser = userResponse.data;
      const { accessToken, refreshToken } = useAuthStore.getState();

      if (accessToken && refreshToken) {
        setAuth(updatedUser, accessToken, refreshToken);
      }

      setSuccessMessage('Profile updated successfully');
      setProfileData({ ...profileData, password: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.detail || 'Failed to update profile');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: userAPI.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      setSuccessMessage('Notification preferences updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      setErrorMessage('Failed to update notification preferences');
      setTimeout(() => setErrorMessage(''), 3000);
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (profileData.password && profileData.password !== profileData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const updateData: any = {
      username: profileData.username,
      email: profileData.email,
    };

    if (profileData.password) {
      updateData.password = profileData.password;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNotificationsMutation.mutate(notificationData);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 mt-2">Manage your account settings and preferences</p>
        </div>

        {successMessage && (
          <div className="bg-white border border-gray-300 rounded-md p-4">
            <p className="text-sm text-black">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-900/50 border border-red-700 rounded-md p-4">
            <p className="text-sm text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Profile Settings</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                New Password (leave blank to keep current)
              </label>
              <input
                type="password"
                value={profileData.password}
                onChange={(e) => setProfileData({ ...profileData, password: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={profileData.confirmPassword}
                onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
            >
              {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Notification Settings</h2>

          {prefsLoading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <form onSubmit={handleNotificationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notification Email
                </label>
                <input
                  type="email"
                  value={notificationData.email}
                  onChange={(e) => setNotificationData({ ...notificationData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationData.enabled}
                    onChange={(e) => setNotificationData({ ...notificationData, enabled: e.target.checked })}
                    className="w-4 h-4 bg-black border-gray-700 rounded focus:ring-white focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Enable email notifications</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationData.notify_on_error}
                    onChange={(e) => setNotificationData({ ...notificationData, notify_on_error: e.target.checked })}
                    className="w-4 h-4 bg-black border-gray-700 rounded focus:ring-white focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Notify on error logs</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationData.notify_on_warning}
                    onChange={(e) => setNotificationData({ ...notificationData, notify_on_warning: e.target.checked })}
                    className="w-4 h-4 bg-black border-gray-700 rounded focus:ring-white focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-gray-300">Notify on warning logs</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={updateNotificationsMutation.isPending}
                className="px-4 py-2 bg-white text-black rounded-md hover:bg-gray-200 disabled:opacity-50 font-medium transition-colors"
              >
                {updateNotificationsMutation.isPending ? 'Updating...' : 'Update Notifications'}
              </button>
            </form>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}