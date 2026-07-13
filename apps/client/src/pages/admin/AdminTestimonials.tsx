import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Star, Check } from 'lucide-react';
import Card from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList } from '@/hooks/useQuery';
import api from '@/services/api';
import type { Testimonial } from '@/types';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminTestimonials() {
  const [filter, setFilter] = useState<string | undefined>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useFetchList<Testimonial>(
    ['admin-testimonials', filter || ''],
    '/testimonials',
    filter ? { isApproved: filter } : {}
  );
  const testimonials = data?.data || [];

  const handleApprove = async (id: string, isApproved: boolean) => {
    try {
      await api.patch(`/testimonials/${id}/approve`);
      toast.success(isApproved ? 'Testimonial dinonaktifkan' : 'Testimonial disetujui');
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengupdate testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus testimonial ini?')) return;
    try {
      await api.delete(`/testimonials/${id}`);
      toast.success('Testimonial berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-testimonials'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menghapus testimonial');
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Testimoni</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Kelola testimoni pelanggan</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {[
          { label: 'Semua', value: undefined },
          { label: 'Disetujui', value: 'true' },
          { label: 'Menunggu', value: 'false' },
        ].map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-sm rounded-xl font-medium transition-colors ${
              filter === f.value ? 'bg-gold-500 text-white' : 'bg-gray-100 dark:bg-dark-hover text-gray-600 dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-hover/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonials.map((t: Testimonial) => (
            <Card key={t.id} className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full theme-accent-gradient-br flex items-center justify-center text-white font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-dark-text text-sm">{t.name}</p>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleApprove(t.id, t.isApproved)}
                    className={`p-1.5 rounded-lg ${t.isApproved ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30' : 'text-gray-400 dark:text-dark-text-tertiary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-dark-text-secondary leading-relaxed">"{t.comment}"</p>
            </Card>
          ))}
          {testimonials.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-dark-text-secondary">
              Belum ada testimoni
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
