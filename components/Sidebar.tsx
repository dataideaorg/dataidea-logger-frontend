'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Projects', href: '/projects', icon: '📁' },
  { name: 'Event Logs', href: '/event-logs', icon: '📝' },
  { name: 'LLM Logs', href: '/llm-logs', icon: '🤖' },
  { name: 'API Keys', href: '/api-keys', icon: '🔑' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <div className="flex h-screen w-64 flex-col bg-black border-r border-gray-800">
      <div className="flex h-16 items-center px-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">DataIdea Logger</h1>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                }
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{user?.username}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-black bg-white rounded-md hover:bg-gray-200 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}