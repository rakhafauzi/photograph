import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Skeleton from '@/components/ui/skeleton';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import type { Booking } from '@/types';
import { toast } from 'sonner';

export default function AdminBookingDetail() {
  const { id } = useParams();
  const [selectedStatus, setSelectedStatus] = useState('');

  const { data, isLoading } = useFetch<Booking>(
    ['booking-detail', id || ''],
    `/bookings/${id}`,
    { enabled: !!id }
  );

  const booking = data?.data;

  const updateStatus = useMutationAction<{ status: string }, any>(
    `/bookings/${id}/status`,
    'patch',
    { successMessage: 'Status booking berhasil diupdate', invalidateKeys: [['booking-detail', id || ''], ['admin-bookings']] }
  );

  const handleUpdateStatus = async (status: string) => {
    await updateStatus.mutateAsync({ status });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton variant="card" className="h-64" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Booking tidak ditemukan</p>
        <Link to="/admin/bookings">
          <Button variant="outline" className="mt-4">Kembali</Button>
        </Link>
      </div>
    );
  }

  const statusActions = [
    { status: 'processed', label: 'Proses', color: 'bg-blue-600 hover:bg-blue-700' },
    { status: 'confirmed', label: 'Konfirmasi', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { status: 'completed', label: 'Selesai', color: 'bg-green-600 hover:bg-green-700' },
    { status: 'cancelled', label: 'Batalkan', color: 'bg-red-600 hover:bg-red-700' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Link to="/admin/bookings" className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text mb-6">
        <ChevronLeft className="w-4 h-4" /> Kembali ke Booking
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">{booking.name}</h1>
          <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
            Invoice: <span className="font-mono font-semibold">{booking.invoiceNumber}</span>
          </p>
        </div>
        <Badge className={`${getStatusColor(booking.status)} text-sm px-4 py-1.5`}>
          {getStatusLabel(booking.status)}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">Informasi Customer</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50 dark:border-dark-border">
              <span className="text-gray-500 dark:text-dark-text-secondary">Nama</span>
              <span className="font-medium text-gray-900 dark:text-dark-text">{booking.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Email</span>
              <span className="font-medium text-gray-900">{booking.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">WhatsApp</span>
              <span className="font-medium text-gray-900">{booking.phone}</span>
            </div>
            {booking.address && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Alamat</span>
                <span className="font-medium text-gray-900">{booking.address}</span>
              </div>
            )}
            {booking.eventLocation && (
              <div className="flex justify-between py-2 border-b border-gray-50">
                <span className="text-gray-500">Lokasi Acara</span>
                <span className="font-medium text-gray-900">{booking.eventLocation}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Booking Info */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">Detail Booking</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Paket</span>
              <span className="font-medium text-gray-900">{booking.package?.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Tanggal</span>
              <span className="font-medium text-gray-900">{formatDate(booking.eventDate)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Jam</span>
              <span className="font-medium text-gray-900">{booking.eventTime} WIB</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Total Harga</span>
              <span className="font-semibold text-gray-900">{formatPrice(booking.totalPrice)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">DP (30%)</span>
              <span className="font-medium theme-accent-text">{formatPrice(booking.downPayment)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Sisa</span>
              <span className="font-medium text-gray-900">{formatPrice(booking.remainingPayment)}</span>
            </div>
          </div>
        </Card>

        {/* Status Management */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">Update Status</h3>
          <div className="flex flex-wrap gap-3">
            {statusActions.map((action) => (
              <Button
                key={action.status}
                className={action.color}
                size="sm"
                disabled={booking.status === action.status || updateStatus.isPending}
                isLoading={updateStatus.isPending}
                onClick={() => handleUpdateStatus(action.status)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </Card>

        {/* Payments */}
        {booking.payments && booking.payments.length > 0 && (
          <Card className="lg:col-span-2">
            <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-4">Riwayat Pembayaran</h3>
            <div className="space-y-3">
              {booking.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-hover">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-dark-text">{formatPrice(payment.amount)}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                      {payment.bankName && `${payment.bankName} - `}
                      {payment.accountName}
                      {payment.transferDate && ` • ${formatDate(payment.transferDate)}`}
                    </p>
                  </div>
                  <Badge className={getStatusColor(payment.status)}>
                    {getStatusLabel(payment.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
