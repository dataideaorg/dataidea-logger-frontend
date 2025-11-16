'use client';

import AuthGuard from './AuthGuard';
import Sidebar from './Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}