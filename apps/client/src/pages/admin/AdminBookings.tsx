import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, Eye } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList } from '@/hooks/useQuery';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import type { Booking } from '@/types';

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'waiting_payment', label: 'Menunggu Pembayaran' },
  { value: 'processed', label: 'Diproses' },
  { value: 'confirmed', label: 'Dikonfirmasi' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

const paymentStatusOptions = [
  { value: '', label: 'Semua Pembayaran' },
  { value: 'unpaid', label: 'Belum Bayar' },
  { value: 'waiting_verification', label: 'Menunggu Verifikasi' },
  { value: 'paid', label: 'Lunas' },
  { value: 'rejected', label: 'Ditolak' },
];

export default function AdminBookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (search) params.search = search;
  if (statusFilter) params.status = statusFilter;
  if (paymentFilter) params.paymentStatus = paymentFilter;

  const { data, isLoading } = useFetchList<Booking>(
    ['admin-bookings', String(page), search, statusFilter, paymentFilter],
    '/bookings/all',
    params
  );

  const bookings = data?.data || [];
  const meta = data?.meta;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Booking</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Kelola semua pemesanan</p>
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Cari nama, email, invoice..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            />
          </div>
          <div className="w-48">
            <Select
              options={paymentStatusOptions}
              value={paymentFilter}
              onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <TableSkeleton rows={10} />
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada booking</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Invoice</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Paket</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Tanggal</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Total</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Status</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Pembayaran</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking: Booking) => (
                    <tr key={booking.id} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover">
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono font-semibold text-gray-900 dark:text-dark-text">{booking.invoiceNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{booking.name}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">{booking.email}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-dark-text-secondary">{booking.package?.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                        {formatDate(booking.eventDate, 'short')}
                        <br />
                        <span className="text-xs text-gray-400 dark:text-dark-text-tertiary">{booking.eventTime}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-dark-text">
                        {formatPrice(booking.totalPrice)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(booking.paymentStatus)}>
                          {getStatusLabel(booking.paymentStatus)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/admin/bookings/${booking.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  Menampilkan {((page - 1) * 20) + 1}-{Math.min(page * 20, meta.total)} dari {meta.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= (meta.totalPages || 1)}
                    onClick={() => setPage(page + 1)}
                  >
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </motion.div>
  );
}
