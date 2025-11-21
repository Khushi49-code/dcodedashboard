'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Users,
  Mail,
  FileText,
  Briefcase,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

const tabs = [
  // { id: 'users', label: 'Users', icon: Users, path: '/user' },
  { id: 'connect', label: 'Connect', icon: Mail, path: '/connect' },
  { id: 'blog', label: 'Blog', icon: FileText, path: '/Blog' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, path: '/job' },
    { id: 'apply', label: 'Job Apply', icon: Briefcase, path: '/job-apply' },
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('authenticated');
    router.push('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-800">
            Dcode Dashboard
          </h1>

          {/* Desktop Tabs */}
          <div className="hidden md:flex items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.path;
              return (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.path)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-slate-900 px-2 py-1.5 rounded-md hover:bg-slate-100 text-sm"
            >
              <LogOut size={16} />
              Logout
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.path;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    router.push(tab.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
