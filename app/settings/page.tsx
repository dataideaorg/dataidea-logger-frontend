'use client';

import { useState, useEffect } from 'react';
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
    currentPassword: '',
    newPassword: '',
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
    email: '',
    enabled: true,
    notify_on_error: true,
    notify_on_warning: false,
  });

  // Update notificationData when prefs are loaded
  useEffect(() => {
    if (notificationPrefs) {
      setNotificationData({
        email: notificationPrefs.email || '',
        enabled: notificationPrefs.enabled ?? true,
        notify_on_error: notificationPrefs.notify_on_error ?? true,
        notify_on_warning: notificationPrefs.notify_on_warning ?? false,
      });
    }
  }, [notificationPrefs]);

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
      setProfileData({ ...profileData, currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error: any) => {
      const errorData = error.response?.data;
      let errorMsg = 'Failed to update profile';

      // Handle validation errors
      if (errorData) {
        if (errorData.current_password) {
          errorMsg = errorData.current_password[0] || errorData.current_password;
        } else if (errorData.username) {
          errorMsg = errorData.username[0] || errorData.username;
        } else if (errorData.email) {
          errorMsg = errorData.email[0] || errorData.email;
        } else if (errorData.detail) {
          errorMsg = errorData.detail;
        }
      }

      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 5000);
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) =>
      userAPI.updateNotificationPreferences(id, data),
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

    // Validate password matching
    if (profileData.newPassword && profileData.newPassword !== profileData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    // Validate current password is provided when changing password
    if (profileData.newPassword && !profileData.currentPassword) {
      setErrorMessage('Current password is required to set a new password');
      return;
    }

    const updateData: any = {
      username: profileData.username,
      email: profileData.email,
    };

    // Add password fields if changing password
    if (profileData.newPassword && profileData.currentPassword) {
      updateData.current_password = profileData.currentPassword;
      updateData.new_password = profileData.newPassword;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notificationPrefs?.id) {
      setErrorMessage('Unable to update preferences. Please refresh the page.');
      return;
    }
    updateNotificationsMutation.mutate({ id: notificationPrefs.id, data: notificationData });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-[#e5e5e5]">Settings</h1>
          <p className="text-[#a5a5a5] mt-2">Manage your account settings and preferences</p>
        </div>

        {successMessage && (
          <div className="bg-[#e5e5e5] border border-gray-300 rounded-md p-4">
            <p className="text-sm text-[#1a1a1a]">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="bg-red-900/50 border border-red-700 rounded-md p-4">
            <p className="text-sm text-red-200">{errorMessage}</p>
          </div>
        )}

        {/* Profile Settings */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#e5e5e5] mb-4">Profile Settings</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                Email
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            <div className="border-t border-[#3a3a3a] pt-4 mt-4">
              <p className="text-sm text-[#a5a5a5] mb-4">Leave password fields blank to keep your current password</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => setProfileData({ ...profileData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                    placeholder="Required when changing password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] disabled:opacity-50 font-medium transition-colors"
            >
              {updateProfileMutation.isPending ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-[#e5e5e5] mb-4">Notification Settings</h2>

          {prefsLoading ? (
            <div className="text-[#a5a5a5]">Loading...</div>
          ) : (
            <form onSubmit={handleNotificationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#c5c5c5] mb-1">
                  Notification Email
                </label>
                <input
                  type="email"
                  value={notificationData.email}
                  onChange={(e) => setNotificationData({ ...notificationData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-md text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationData.enabled}
                    onChange={(e) => setNotificationData({ ...notificationData, enabled: e.target.checked })}
                    className="w-4 h-4 bg-[#1a1a1a] border-gray-700 rounded focus:ring-white focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-[#c5c5c5]">Enable email notifications</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationData.notify_on_error}
                    onChange={(e) => setNotificationData({ ...notificationData, notify_on_error: e.target.checked })}
                    className="w-4 h-4 bg-[#1a1a1a] border-gray-700 rounded focus:ring-white focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-[#c5c5c5]">Notify on error logs</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={notificationData.notify_on_warning}
                    onChange={(e) => setNotificationData({ ...notificationData, notify_on_warning: e.target.checked })}
                    className="w-4 h-4 bg-[#1a1a1a] border-gray-700 rounded focus:ring-white focus:ring-2"
                  />
                  <span className="ml-2 text-sm text-[#c5c5c5]">Notify on warning logs</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={updateNotificationsMutation.isPending}
                className="px-4 py-2 bg-[#e5e5e5] text-[#1a1a1a] rounded-md hover:bg-[#c5c5c5] disabled:opacity-50 font-medium transition-colors"
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