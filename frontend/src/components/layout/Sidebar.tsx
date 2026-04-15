'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, Bus, MapPin, CalendarCheck,
  BarChart3, Zap, Settings, LogOut, ChevronRight,
} from 'lucide-react';

const NAV = [
  { href: '/dashboard',          label: 'Overview',   icon: LayoutDashboard },
  { href: '/dashboard/buses',    label: 'Buses',      icon: Bus },
  { href: '/dashboard/trips',    label: 'Trips',      icon: MapPin },
  { href: '/dashboard/bookings', label: 'Bookings',   icon: CalendarCheck },
  { href: '/dashboard/revenue',  label: 'Revenue',    icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-sidebar text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 h-16 border-b border-white/5">
        <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight">Ra7ti</span>
        <span className="ml-auto text-[10px] font-medium text-white/30 border border-white/10 rounded-md px-1.5 py-0.5">
          BETA
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold text-white/25 tracking-widest uppercase px-3 mb-3">
          Platform
        </p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-brand-600/20 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0 transition-colors', active ? 'text-brand-400' : 'text-white/40 group-hover:text-white/70')} />
              {label}
              {active && <ChevronRight className="h-3 w-3 ml-auto text-white/30" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 py-4 border-t border-white/5 space-y-0.5">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/5 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>

        {/* User pill */}
        <div className="mt-3 flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5">
          <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.name ?? 'User'}</p>
            <p className="text-[11px] text-white/35 truncate">{user?.email ?? ''}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
