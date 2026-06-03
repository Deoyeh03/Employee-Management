"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, BarChart3, LogOut, Settings, Calendar, Menu, X } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/');
      return;
    }

    setUser(JSON.parse(storedUser));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return null; // Avoid hydration flash

  return (
    <div className="min-h-screen flex bg-[#0f1115]">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass-panel border-l-0 border-y-0 rounded-none transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-white/10 shrink-0">
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <span className="text-indigo-400">A</span>
              </span>
              Antigravity
            </h1>
            <button 
              className="ml-auto lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
            <NavItem href="/dashboard" icon={BarChart3} label="Overview" />
            <NavItem href="/dashboard/employees" icon={Users} label="Employees" />
            <NavItem href="/dashboard/schedule" icon={Calendar} label="Schedule" />
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-lg bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                {user.firstName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-slate-400 truncate">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center px-4 lg:px-8 border-b border-white/5 bg-[#0f1115]/50 backdrop-blur-md sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <button className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  // Simple active state check - in a real app use usePathname
  const isActive = typeof window !== 'undefined' && window.location.pathname === href;
  
  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        isActive 
          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20' 
          : 'text-slate-300 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      {label}
    </Link>
  );
}
