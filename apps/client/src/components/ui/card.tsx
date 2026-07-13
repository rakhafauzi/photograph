import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className, glass = false, hover = false, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-100 dark:border-dark-border bg-white dark:bg-dark-elevated p-6',
        glass && 'glass',
        hover && 'hover:shadow-lg hover:border-gray-200 transition-all duration-300 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
