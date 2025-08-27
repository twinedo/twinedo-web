'use client'

import { useAdminAuth } from '../hooks/useAdminAuth';
import { useRouter, usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/admin');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { name: 'Projects', href: '/admin/dashboard/projects', icon: '💼' },
    { name: 'Experiences', href: '/admin/dashboard/experiences', icon: '👔' },
    { name: 'Project Images', href: '/admin/dashboard/images', icon: '🖼️' },
    { name: 'CV Management', href: '/admin/dashboard/cv', icon: '📄' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 shrink-0 items-center border-b border-gray-200 px-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        
        <nav className="flex flex-1 flex-col px-6 py-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <a
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                          ${isActive 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                          }
                        `}
                      >
                        <span className="text-lg">{item.icon}</span>
                        {item.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </li>
            
            <li className="mt-auto">
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-x-4 px-2 py-2 text-sm">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-semibold">
                      {user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Admin</p>
                    <p className="text-gray-500 text-xs truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 text-left px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Sign out
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">Content Management System</h2>
            </div>
          </div>
        </div>

        <main className="py-6">
          {children}
        </main>
      </div>
    </div>
  );
}