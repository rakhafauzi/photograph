import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FolderKanban, Calendar, Clock, ChevronRight,
  MoreHorizontal, Search
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Skeleton from '@/components/ui/skeleton';
import { useFetchList } from '@/hooks/useQuery';
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import type { Booking } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '@/services/api';

const workflowColumns = [
  { key: 'pending', label: 'Booked', color: 'bg-blue-500', bg: 'bg-blue-50' },
  { key: 'waiting_payment', label: 'Persiapan', color: 'bg-orange-500', bg: 'bg-orange-50' },
  { key: 'processed', label: 'Shooting', color: 'bg-purple-500', bg: 'bg-purple-50' },
  { key: 'confirmed', label: 'Editing', color: 'bg-cyan-500', bg: 'bg-cyan-50' },
  { key: 'completed', label: 'Completed', color: 'bg-emerald-500', bg: 'bg-emerald-50' },
];

export default function AdminProjects() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useFetchList<Booking>(
    ['admin-projects'],
    '/bookings/all',
    { limit: '100' }
  );

  const bookings = data?.data || [];

  // Filter bookings by search
  const filtered = search
    ? bookings.filter(
        (b: Booking) =>
          b.name.toLowerCase().includes(search.toLowerCase()) ||
          b.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
          b.email.toLowerCase().includes(search.toLowerCase()) ||
          (b.package?.name || '').toLowerCase().includes(search.toLowerCase())
      )
    : bookings;

  // Group bookings by workflow status
  const columns = workflowColumns.map((col) => ({
    ...col,
    items: filtered.filter((b: Booking) => b.status === col.key),
  }));

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      toast.success('Status project berhasil diupdate');
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengupdate status');
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const flow = ['pending', 'waiting_payment', 'processed', 'confirmed', 'completed'];
    const idx = flow.indexOf(currentStatus);
    return idx >= 0 && idx < flow.length - 1 ? flow[idx + 1] : null;
  };

  const getPrevStatus = (currentStatus: string): string | null => {
    const flow = ['pending', 'waiting_payment', 'processed', 'confirmed', 'completed'];
    const idx = flow.indexOf(currentStatus);
    return idx > 0 ? flow[idx - 1] : null;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Project</h1>
          <p className="text-gray-500 text-sm mt-1">Kelola workflow project dari booking hingga selesai</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari customer, invoice, atau paket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="card" className="h-96" />
            ))}
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1000px]">
            {columns.map((column) => (
              <div key={column.key} className="flex-1 min-w-[200px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${column.color}`} />
                    <h3 className="font-semibold text-gray-900 text-sm">{column.label}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {column.items.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className={`space-y-3 p-2 rounded-2xl ${column.bg} min-h-[500px]`}>
                  {column.items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center mb-2">
                        <FolderKanban className="w-5 h-5 text-gray-300" />
                      </div>
                      <p className="text-xs text-gray-400">Belum ada project</p>
                    </div>
                  ) : (
                    column.items.map((booking: Booking) => (
                      <motion.div
                        key={booking.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-200 cursor-pointer group"
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between mb-2">
                          <Link
                            to={`/admin/bookings/${booking.id}`}
                            className="text-xs font-mono font-semibold text-gray-400 hover:text-gold-600"
                          >
                            {booking.invoiceNumber}
                          </Link>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 rounded-lg hover:bg-gray-100">
                              <MoreHorizontal className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                          </div>
                        </div>

                        {/* Customer Name */}
                        <Link to={`/admin/bookings/${booking.id}`}>
                          <h4 className="font-semibold text-gray-900 text-sm mb-1 hover:text-gold-600 transition-colors">
                            {booking.name}
                          </h4>
                        </Link>

                        {/* Package */}
                        <p className="text-xs text-gray-500 mb-3">
                          {booking.package?.name || '-'}
                        </p>

                        {/* Event Date */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(booking.eventDate, 'short')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{booking.eventTime} WIB</span>
                        </div>

                        {/* Payment Status */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          <Badge className={getStatusColor(booking.paymentStatus)}>
                            {getStatusLabel(booking.paymentStatus)}
                          </Badge>

                          {/* Move Forward/Backward */}
                          <div className="flex gap-1">
                            {getPrevStatus(booking.status) && (
                              <button
                                onClick={() => handleStatusChange(booking.id, getPrevStatus(booking.status)!)}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-orange-500 hover:bg-orange-50 transition-colors"
                                title="Mundur"
                              >
                                <ChevronRight className="w-4 h-4 rotate-180" />
                              </button>
                            )}
                            {getNextStatus(booking.status) && (
                              <button
                                onClick={() => handleStatusChange(booking.id, getNextStatus(booking.status)!)}
                                className="p-1.5 rounded-lg text-gray-300 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                                title="Lanjut"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
