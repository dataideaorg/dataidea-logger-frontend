'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/api';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');

      if (!code) {
        setError('No authorization code received');
        return;
      }

      try {
        const response = await authAPI.googleCallback(code);
        const { access_token, refresh_token, user } = response.data;

        setAuth(user, access_token, refresh_token);
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Google authentication failed');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, setAuth, router]);

  return (
    <div className="text-center">
      {error ? (
        <div className="space-y-4">
          <p className="text-red-400">{error}</p>
          <p className="text-gray-400">Redirecting to login...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-[#e5e5e5] text-xl">Completing Google sign-in...</div>
          <div className="text-gray-400">Please wait</div>
        </div>
      )}
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
      <Suspense fallback={
        <div className="text-center">
          <div className="text-[#e5e5e5] text-xl">Loading...</div>
        </div>
      }>
        <GoogleCallbackContent />
      </Suspense>
    </div>
  );
}