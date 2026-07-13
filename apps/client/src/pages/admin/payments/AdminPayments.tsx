import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, Wallet, CheckCircle, XCircle, Eye, Download,
  Filter, ArrowUpDown, ImageIcon, Loader
} from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList, useMutationAction } from '@/hooks/useQuery';
import api from '@/services/api';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import type { Payment } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'waiting_verification', label: 'Menunggu Verifikasi' },
  { value: 'verified', label: 'Terverifikasi' },
  { value: 'rejected', label: 'Ditolak' },
];

export default function AdminPayments() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [previewPayment, setPreviewPayment] = useState<Payment | null>(null);
  const [rejectModal, setRejectModal] = useState<Payment | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const params: Record<string, string> = { page: String(page), limit: '20' };
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useFetchList<Payment>(
    ['admin-payments', String(page), statusFilter],
    '/payments',
    params
  );

  const payments = data?.data || [];
  const meta = data?.meta;

  const handleApprove = async (payment: Payment) => {
    try {
      await api.patch(`/payments/${payment.id}/verify`, { status: 'verified' });
      toast.success('Pembayaran berhasil diverifikasi');
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal verifikasi pembayaran');
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await api.patch(`/payments/${rejectModal.id}/verify`, {
        status: 'rejected',
        notes: rejectReason,
      });
      toast.success('Pembayaran ditolak');
      setRejectModal(null);
      setRejectReason('');
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal menolak pembayaran');
    }
  };

  // Filter payments
  const filtered = payments.filter((p: Payment) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.booking?.invoiceNumber?.toLowerCase().includes(q) ||
      p.booking?.name?.toLowerCase().includes(q) ||
      p.accountName?.toLowerCase().includes(q) ||
      p.bankName?.toLowerCase().includes(q)
    );
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Pembayaran</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Kelola verifikasi pembayaran dan invoice</p>
      </div>

      <Card>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Cari invoice, customer, bank..."
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
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada pembayaran</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Invoice</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Metode</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Jumlah</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Tanggal</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Status</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((payment: Payment) => (
                    <tr key={payment.id} className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-xs font-mono font-semibold text-gray-900 dark:text-dark-text">
                          {payment.booking?.invoiceNumber || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{payment.booking?.name || payment.accountName || '-'}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">{payment.accountName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-gray-700 dark:text-dark-text">{payment.paymentMethod || payment.bankName || '-'}</p>
                          {payment.bankName && payment.paymentMethod && (
                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">{payment.bankName}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-dark-text">
                        {formatPrice(payment.amount)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                        {payment.transferDate ? formatDate(payment.transferDate, 'short') : formatDate(payment.createdAt, 'short')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={getStatusColor(payment.status)}>
                          {getStatusLabel(payment.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          {/* Preview Proof */}
                          <button
                            onClick={() => setPreviewPayment(payment)}
                            className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Lihat Bukti Transfer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Approve */}
                          {payment.status === 'waiting_verification' && (
                            <>
                              <button
                                onClick={() => handleApprove(payment)}
                                className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                title="Setujui"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setRejectModal(payment)}
                                className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="Tolak"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Download Invoice */}
                          <button
                            className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-gold-600 hover:bg-gold-50 transition-colors"
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

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                  Menampilkan {((page - 1) * 20) + 1}-{Math.min(page * 20, meta.total)} dari {meta.total}
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

      {/* Preview Bukti Transfer Modal — Enhanced with Lightbox */}
      <Modal
        isOpen={!!previewPayment}
        onClose={() => setPreviewPayment(null)}
        title="Bukti Transfer"
        size="xl"
      >
        {previewPayment && (
          <div className="space-y-5">
            {/* Payment proof image with lightbox-style viewer */}
            {previewPayment.proofImage ? (
              <div className="group relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                {/* Image with zoom-on-hover effect */}
                <div className="relative overflow-hidden cursor-zoom-in">
                  <img
                    src={previewPayment.proofImage}
                    alt="Bukti Transfer"
                    className="w-full max-h-[420px] object-contain mx-auto transition-transform duration-500 hover:scale-105"
                  />
                  {/* Glass overlay on hover with zoom indicator */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm">
                      <Search className="w-3.5 h-3.5 inline-block mr-1" />
                      Klik untuk perbesar
                    </span>
                  </div>
                </div>

                {/* Image toolbar */}
                <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2 bg-gray-50/80">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Bukti transfer
                  </div>
                  <a
                    href={previewPayment.proofImage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-medium text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <Search className="w-3 h-3" />
                    Buka gambar
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl bg-gray-50 border border-dashed border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-medium">Tidak ada bukti transfer</p>
                <p className="text-gray-400 text-xs mt-1">Customer belum mengupload bukti pembayaran.</p>
              </div>
            )}

            {/* Payment details — styled as a modern card grid */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Detail Pembayaran</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Jumlah</p>
                  <p className="mt-1 text-lg font-bold text-gray-900">{formatPrice(previewPayment.amount)}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Status</p>
                  <div className="mt-1">
                    <Badge className={getStatusColor(previewPayment.status)}>
                      {getStatusLabel(previewPayment.status)}
                    </Badge>
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Bank / Metode</p>
                  <p className="mt-1 font-semibold text-gray-900">{previewPayment.bankName || '-'}</p>
                  {previewPayment.paymentMethod && (
                    <p className="text-xs text-gray-500">{previewPayment.paymentMethod}</p>
                  )}
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Nama Akun</p>
                  <p className="mt-1 font-semibold text-gray-900">{previewPayment.accountName || '-'}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">No. Rekening</p>
                  <p className="mt-1 font-mono font-semibold text-gray-900">{previewPayment.accountNumber || '-'}</p>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 p-4">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Tanggal Transfer</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {previewPayment.transferDate ? formatDate(previewPayment.transferDate) : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {previewPayment.status === 'waiting_verification' && (
              <div className="flex gap-3 justify-end pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModal(previewPayment);
                    setPreviewPayment(null);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" /> Tolak
                </Button>
                <Button
                  variant="gold"
                  onClick={() => {
                    handleApprove(previewPayment);
                    setPreviewPayment(null);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Setujui
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectModal}
        onClose={() => { setRejectModal(null); setRejectReason(''); }}
        title="Tolak Pembayaran"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Apakah Anda yakin ingin menolak pembayaran ini? Berikan alasan penolakan.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Alasan Penolakan</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Contoh: Bukti transfer tidak jelas, jumlah tidak sesuai..."
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 resize-none min-h-[100px]"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
              Batal
            </Button>
            <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()}>
              Tolak Pembayaran
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
