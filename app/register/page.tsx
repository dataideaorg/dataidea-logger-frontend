'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/services/api';

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.register(formData);
      router.push('/login?registered=true');
    } catch (err: any) {
      const errorData = err.response?.data;
      if (errorData) {
        const errorMessages = Object.entries(errorData)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        setError(errorMessages);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Join DataIdea Logger
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-gray-900 p-8 rounded-lg" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-900/50 border border-red-700 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password_confirm" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <input
                id="password_confirm"
                name="password_confirm"
                type="password"
                required
                value={formData.password_confirm}
                onChange={(e) => setFormData({ ...formData, password_confirm: e.target.value })}
                className="mt-1 block w-full px-3 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-white hover:text-gray-300">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}