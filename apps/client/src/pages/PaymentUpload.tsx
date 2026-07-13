import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Upload, CheckCircle, AlertCircle, Building, Banknote, CalendarDays } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Card from '@/components/ui/card';
import Select from '@/components/ui/select';
import { useFetch } from '@/hooks/useQuery';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Booking, WebsiteSettings } from '@/types';
import api from '@/services/api';
import { toast } from 'sonner';
import { getPaymentMethods } from '@/lib/settings';

export default function PaymentUpload() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('booking');
  const invoiceNumber = searchParams.get('invoice');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [formData, setFormData] = useState({
    amount: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    transferDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const { data: bookingData, isLoading } = useFetch<Booking>(
    ['booking-payment', bookingId || ''],
    bookingId ? `/bookings/public/${bookingId}` : '',
    { enabled: !!bookingId }
  );
  const { data: settingsData } = useFetch<WebsiteSettings>(['payment-settings'], '/settings');

  const booking = bookingData?.data;
  const settings = settingsData?.data || {};
  const paymentMethods = getPaymentMethods(settings).filter((method) => method.isActive);
  const selectedMethodDetails = paymentMethods.find((method) => method.id === selectedPaymentMethod);

  useEffect(() => {
    if (!selectedPaymentMethod && paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
  }, [paymentMethods, selectedPaymentMethod]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran file maksimal 5MB');
        return;
      }
      setProofFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => {
        setProofPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingId || !proofFile) {
      toast.error('Pilih file bukti transfer terlebih dahulu');
      return;
    }

    if (paymentMethods.length > 0 && !selectedPaymentMethod) {
      toast.error('Pilih metode pembayaran tujuan terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    try {
      const formPayload = new FormData();
      formPayload.append('bookingId', bookingId);
      formPayload.append('proofImage', proofFile);
      formPayload.append('amount', formData.amount);
      formPayload.append('bankName', formData.bankName);
      formPayload.append('accountName', formData.accountName);
      formPayload.append('accountNumber', formData.accountNumber);
      formPayload.append('transferDate', formData.transferDate);
      if (selectedMethodDetails) {
        formPayload.append('paymentMethod', selectedMethodDetails.label);
      }
      if (formData.notes) formPayload.append('notes', formData.notes);

      await api.post('/payments', formPayload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsSuccess(true);
      toast.success('Bukti pembayaran berhasil dikirim!');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Gagal mengirim bukti pembayaran';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingId && !invoiceNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-accent-bg-soft">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Data booking tidak ditemukan</h2>
          <p className="text-gray-500 mt-2">Silakan lakukan pemesanan terlebih dahulu.</p>
          <Link to="/" className="inline-block mt-6">
            <Button variant="gold">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-accent-bg-soft">
        <div className="animate-spin w-8 h-8 border-2 theme-accent-border border-t-transparent rounded-full" />
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen theme-accent-bg-soft">
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">Bukti Pembayaran Terkirim!</h1>
          <p className="text-gray-500 mt-2">
            Bukti transfer Anda sedang diverifikasi oleh tim kami. Kami akan mengkonfirmasi pembayaran Anda dalam 1x24 jam.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to={`/track-booking`}>
              <Button variant="gold" className="w-full">
                Lacak Status Pemesanan
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Kembali ke Beranda
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const suggestedAmount = booking ? Math.round(booking.downPayment) : 0;

  return (
    <div className="min-h-screen theme-accent-bg-soft">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">Upload Bukti Pembayaran</h1>
            <p className="text-sm text-gray-500">Konfirmasi pembayaran DP Anda</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Booking Info */}
          {booking && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Informasi Booking</h3>
                <span className="text-xs font-mono font-semibold theme-accent-text">
                  {booking.invoiceNumber}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Paket</span>
                  <span className="font-medium text-gray-900">{booking.package?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tanggal Acara</span>
                  <span className="font-medium text-gray-900">{formatDate(booking.eventDate, 'short')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Harga</span>
                  <span className="font-semibold text-gray-900">{formatPrice(booking.totalPrice)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <span className="text-gray-500">DP yang harus dibayar</span>
                  <span className="font-bold theme-accent-text text-base">{formatPrice(booking.downPayment)}</span>
                </div>
              </div>
            </Card>
          )}

          {paymentMethods.length > 0 && (
            <Card className="bg-gray-50">
              <h3 className="font-semibold text-gray-900 mb-4">Tujuan Pembayaran</h3>
              <div className="space-y-4">
                <Select
                  label="Pilih Metode Tujuan"
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  options={paymentMethods.map((method) => ({
                    value: method.id,
                    label: method.label,
                  }))}
                />
                {selectedMethodDetails && (
                  <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
                    <p className="font-semibold text-gray-900">{selectedMethodDetails.label}</p>
                    {selectedMethodDetails.bankName && <p><strong>Bank / Provider:</strong> {selectedMethodDetails.bankName}</p>}
                    {selectedMethodDetails.accountName && <p><strong>Atas Nama:</strong> {selectedMethodDetails.accountName}</p>}
                    {selectedMethodDetails.accountNumber && <p><strong>No. Rekening / Tujuan:</strong> {selectedMethodDetails.accountNumber}</p>}
                    {selectedMethodDetails.instructions && <p className="mt-2">{selectedMethodDetails.instructions}</p>}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Payment Form */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Form Pembayaran</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Bukti Transfer <span className="text-red-500">*</span>
                </label>
                {proofPreview ? (
                  <div className="relative group rounded-xl overflow-hidden border border-gray-200">
                    <img src={proofPreview} alt="Bukti Transfer" className="w-full h-48 object-contain bg-gray-50" />
                    <button
                      type="button"
                      onClick={() => { setProofFile(null); setProofPreview(null); }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:theme-accent-border hover:theme-accent-bg-soft-strong transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">Klik untuk upload bukti transfer</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP (max 5MB)</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                )}
              </div>

              {/* Amount */}
              <div className="relative">
                <Input
                  label="Jumlah Transfer"
                  type="number"
                  placeholder={String(suggestedAmount)}
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  icon={<Banknote className="w-4 h-4" />}
                  required
                />
                {suggestedAmount > 0 && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, amount: String(suggestedAmount) })}
                    className="absolute right-3 top-[38px] text-xs theme-accent-text hover:opacity-80 font-medium"
                  >
                    DP {formatPrice(suggestedAmount)}
                  </button>
                )}
              </div>

              {/* Bank Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  label="Nama Bank"
                  placeholder="BCA / BRI / Mandiri"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  icon={<Building className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Nama Pemilik Rekening"
                  placeholder="Nama di rekening"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  required
                />
                <Input
                  label="No. Rekening"
                  placeholder="Nomor rekening"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  required
                />
                <Input
                  label="Tanggal Transfer"
                  type="date"
                  value={formData.transferDate}
                  onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                  icon={<CalendarDays className="w-4 h-4" />}
                  required
                />
              </div>

              <Textarea
                label="Catatan (Opsional)"
                placeholder="Tambahan informasi jika ada..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <Button
                type="submit"
                variant="gold"
                className="w-full"
                size="lg"
                isLoading={isSubmitting}
              >
                <Upload className="w-5 h-5 mr-2" />
                Kirim Bukti Pembayaran
              </Button>

              <p className="text-xs text-gray-400 text-center">
                Bukti pembayaran akan diverifikasi oleh admin dalam 1x24 jam
              </p>
            </form>
          </Card>

          {/* Payment Info */}
          <Card className="theme-accent-surface theme-accent-border">
            <h3 className="font-semibold theme-accent-text-strong mb-2">Informasi Penting</h3>
            <ul className="space-y-2 text-sm theme-accent-text-strong">
              {settings.payment_instructions && (
                <li className="flex items-start gap-2">
                  <span className="theme-accent-text mt-0.5">•</span>
                  <span>{settings.payment_instructions}</span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <span className="theme-accent-text mt-0.5">•</span>
                <span>Transfer DP sesuai dengan jumlah yang tertera di invoice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="theme-accent-text mt-0.5">•</span>
                <span>Upload bukti transfer yang jelas (screenshot/memo transfer)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="theme-accent-text mt-0.5">•</span>
                <span>Verifikasi dilakukan dalam 1x24 jam pada hari kerja</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="theme-accent-text mt-0.5">•</span>
                <span>Booking akan dikonfirmasi setelah pembayaran diverifikasi</span>
              </li>
              {settings.payment_confirmation_note && (
                <li className="flex items-start gap-2">
                  <span className="text-gold-500 mt-0.5">•</span>
                  <span>{settings.payment_confirmation_note}</span>
                </li>
              )}
            </ul>
          </Card>

          {/* Back link */}
          <div className="text-center">
            <Link to="/track-booking" className="text-sm theme-accent-text hover:opacity-80">
              Lacak status pemesanan Anda &rarr;
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
