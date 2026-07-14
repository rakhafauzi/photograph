import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FileText, Search, Download, Eye, Printer, ChevronRight, Filter
} from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList } from '@/hooks/useQuery';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import type { Booking } from '@/types';
import { toast } from 'sonner';

const monthOptions = [
  { value: '', label: 'Semua Bulan' },
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
];

export default function AdminInvoices() {
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<Booking | null>(null);

  const params: Record<string, string> = {
    page: String(page),
    limit: '50',
  };

  const { data, isLoading } = useFetchList<Booking>(
    ['admin-invoices', String(page), search, monthFilter],
    '/bookings/all',
    params
  );

  const bookings = data?.data || [];
  const meta = data?.meta;

  const filteredBookings = bookings.filter((b: Booking) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !b.invoiceNumber?.toLowerCase().includes(q) &&
        !b.name?.toLowerCase().includes(q) &&
        !b.email?.toLowerCase().includes(q)
      )
        return false;
    }
    if (monthFilter) {
      const month = String(new Date(b.eventDate).getMonth() + 1).padStart(2, '0');
      if (month !== monthFilter) return false;
    }
    return true;
  });

  const handleDownloadInvoice = (booking: Booking) => {
    toast.success(`Invoice ${booking.invoiceNumber} siap di-download`);
  };

  const handlePrintInvoice = (booking: Booking) => {
    window.open(`/admin/invoices/${booking.id}/print`, '_blank');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Invoice</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">
          Riwayat invoice dan faktur pembayaran customer
        </p>
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Cari invoice, customer, email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="w-40">
            <Select
              options={monthOptions}
              value={monthFilter}
              onChange={(e) => { setMonthFilter(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada invoice</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Invoice</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Paket</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Dibayar</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking: Booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors cursor-pointer"
                      onClick={() => setSelectedInvoice(booking)}
                    >
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono font-semibold text-gray-900 dark:text-dark-text">
                          {booking.invoiceNumber}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{booking.name}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">{booking.email}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                        {booking.package?.name || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-dark-text-secondary">
                        {formatDate(booking.eventDate, 'short')}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-dark-text">
                        {formatPrice(booking.totalPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                        {booking.paymentStatus === 'paid' ? formatPrice(booking.totalPrice) : '-'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(booking.paymentStatus)}>
                          {getStatusLabel(booking.paymentStatus)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedInvoice(booking); }}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownloadInvoice(booking); }}
                            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Download Invoice"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                <p className="text-sm text-gray-500">
                  Menampilkan {((page - 1) * 50) + 1}-{Math.min(page * 50, meta.total)} dari {meta.total}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    Sebelumnya
                  </Button>
                  <Button variant="outline" size="sm" disabled={page >= (meta.totalPages || 1)} onClick={() => setPage(page + 1)}>
                    Selanjutnya
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Invoice Modal */}
      <Modal
        isOpen={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title={`Invoice ${selectedInvoice?.invoiceNumber || ''}`}
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-5">
            {/* Invoice Header */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-dark-hover">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Status Pembayaran</p>
                <div className="mt-1">
                  <Badge className={getStatusColor(selectedInvoice.paymentStatus)}>
                    {getStatusLabel(selectedInvoice.paymentStatus)}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Invoice</p>
                <p className="font-mono font-bold text-gray-900 dark:text-dark-text">{selectedInvoice.invoiceNumber}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-gray-100 dark:border-dark-border p-4">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Customer</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-dark-text">{selectedInvoice.name}</p>
                <p className="text-xs text-gray-500">{selectedInvoice.email}</p>
                <p className="text-xs text-gray-500">{selectedInvoice.phone}</p>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-dark-border p-4">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Paket & Tanggal</p>
                <p className="mt-1 font-semibold text-gray-900 dark:text-dark-text">{selectedInvoice.package?.name}</p>
                <p className="text-xs text-gray-500">{formatDate(selectedInvoice.eventDate)}</p>
                <p className="text-xs text-gray-500">{selectedInvoice.eventTime} WIB</p>
              </div>
            </div>

            {/* Payment Breakdown */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Rincian Pembayaran</p>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Harga Paket</span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(selectedInvoice.totalPrice)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">DP (Down Payment)</span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(selectedInvoice.downPayment)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-600">Sisa Pembayaran</span>
                  <span className="text-sm font-semibold text-gray-900">{formatPrice(selectedInvoice.remainingPayment)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 dark:border-dark-border">
              <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                Tutup
              </Button>
              <Button variant="outline" onClick={() => handlePrintInvoice(selectedInvoice)}>
                <Printer className="w-4 h-4 mr-2" /> Cetak
              </Button>
              <Button variant="gold" onClick={() => handleDownloadInvoice(selectedInvoice)}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
