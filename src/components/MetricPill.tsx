import { cn } from '@/lib/utils';

interface MetricPillProps {
  value: string;
  positive?: boolean;
  className?: string;
}

export function MetricPill({ value, positive = true, className }: MetricPillProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      positive ? 'bg-[rgba(6,182,212,0.1)] text-[#06b6d4]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]',
      className
    )}>
      {value}
    </span>
  );
}
