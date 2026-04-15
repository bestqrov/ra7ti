import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconBg?: string;
  change?: { value: string; positive: boolean };
  subtitle?: string;
  className?: string;
}

export function StatCard({ title, value, icon, iconBg = 'bg-brand-50', change, subtitle, className }: StatCardProps) {
  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 shadow-card p-6', className)}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
          {(change || subtitle) && (
            <div className="flex items-center gap-1.5">
              {change && (
                <>
                  {change.positive
                    ? <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                    : <TrendingDown className="h-3.5 w-3.5 text-red-500" />
                  }
                  <span className={cn('text-xs font-medium', change.positive ? 'text-emerald-600' : 'text-red-600')}>
                    {change.value}
                  </span>
                </>
              )}
              {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
            </div>
          )}
        </div>
        <div className={cn('rounded-xl p-3', iconBg)}>{icon}</div>
      </div>
    </div>
  );
}
