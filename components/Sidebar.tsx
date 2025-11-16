'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Logs', href: '/logs', icon: '📝' },
  { name: 'Projects', href: '/projects', icon: '📁' },
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
    <div className="flex h-screen w-64 flex-col bg-[#1a1a1a] border-r border-[#3a3a3a]">
      <div className="flex h-16 items-center px-6 border-b border-[#3a3a3a]">
        <h1 className="text-xl font-bold text-[#e5e5e5]">DATAIDEA Logger</h1>
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
                    ? 'bg-[#3a3a3a] text-[#e5e5e5]'
                    : 'text-[#a5a5a5] hover:bg-[#2a2a2a] hover:text-[#e5e5e5]'
                }
              `}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#3a3a3a] p-4">
        <div className="flex items-center mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-[#e5e5e5]">{user?.username}</p>
            <p className="text-xs text-[#a5a5a5]">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-[#1a1a1a] bg-[#e5e5e5] rounded-md hover:bg-[#c5c5c5] transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}