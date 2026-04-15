import { cn } from '@/lib/utils';

type Color = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'orange';

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
  dot?: boolean;
  className?: string;
}

const colors: Record<Color, string> = {
  green:  'bg-emerald-50 text-emerald-700 ring-emerald-200',
  yellow: 'bg-amber-50 text-amber-700 ring-amber-200',
  red:    'bg-red-50 text-red-700 ring-red-200',
  blue:   'bg-blue-50 text-blue-700 ring-blue-200',
  gray:   'bg-gray-100 text-gray-600 ring-gray-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
};

const dotColors: Record<Color, string> = {
  green:  'bg-emerald-500',
  yellow: 'bg-amber-500',
  red:    'bg-red-500',
  blue:   'bg-blue-500',
  gray:   'bg-gray-400',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
};

export function Badge({ children, color = 'gray', dot, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
        colors[color],
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[color])} />}
      {children}
    </span>
  );
}

// Mapping helpers for domain statuses
export const tripStatusColor: Record<string, Color> = {
  SCHEDULED: 'blue', ACTIVE: 'green', CANCELLED: 'red', COMPLETED: 'gray',
};

export const bookingStatusColor: Record<string, Color> = {
  PENDING: 'yellow', CONFIRMED: 'green', CANCELLED: 'red', COMPLETED: 'gray',
};

export const paymentStatusColor: Record<string, Color> = {
  PENDING: 'yellow', COMPLETED: 'green', REFUNDED: 'orange', FAILED: 'red',
};

export const busTypeColor: Record<string, Color> = {
  STANDARD: 'gray', VIP: 'purple', SLEEPER: 'blue',
};
