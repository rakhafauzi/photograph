import { motion } from 'framer-motion';
import { Construction } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlaceholderPageProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export default function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center"
    >
      <div className="w-20 h-20 rounded-2xl theme-accent-bg-soft-strong flex items-center justify-center mb-6">
        {icon || <Construction className="w-10 h-10 theme-accent-text" />}
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      {description && (
        <p className="text-gray-500 max-w-md">{description}</p>
      )}
      <div className="mt-8 flex items-center gap-2 px-4 py-2 rounded-xl theme-accent-surface theme-accent-text text-sm">
        <span className="w-2 h-2 rounded-full theme-accent-text animate-pulse" />
        Dalam Pengembangan
      </div>
    </motion.div>
  );
}
