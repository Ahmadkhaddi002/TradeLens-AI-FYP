import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, hover = true, onClick }: GlassCardProps) {
  return (
    <div
      className={cn(
        'bg-card/80 backdrop-blur-xl border border-border rounded-xl p-6',
        hover && 'transition-all duration-200 ease-out hover:border-[rgba(6,182,212,0.25)] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
