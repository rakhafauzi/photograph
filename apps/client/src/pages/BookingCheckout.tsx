import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Printer, Camera, Upload, Tag, PackagePlus } from 'lucide-react';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

import { formatPrice, getStatusColor, getStatusLabel } from '@/lib/utils';
import { useFetch } from '@/hooks/useQuery';
import type { Booking, WebsiteSettings } from '@/types';
import { getPaymentMethods } from '@/lib/settings';

export default function BookingCheckout() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');
  const invoiceNumber = searchParams.get('invoice');

  const { data: bookingData, isLoading } = useFetch<Booking>(
    ['booking', bookingId || ''],
    bookingId ? `/bookings/public/${bookingId}` : '',
    { enabled: !!bookingId }
  );
  const { data: settingsData } = useFetch<WebsiteSettings>(['settings'], '/settings');

  const booking = bookingData?.data;
  const settings = settingsData?.data || {};
  const paymentInstruction = settings.payment_instructions;
  const paymentMethods = getPaymentMethods(settings).filter((method) => method.isActive);

  if (!bookingId && !invoiceNumber) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Booking tidak ditemukan</h2>
          <p className="text-gray-500 mt-2">Silakan lakukan pemesanan terlebih dahulu.</p>
          <Link to="/">
            <Button variant="gold" className="mt-6">Kembali ke Beranda</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 theme-accent-border border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-500 mt-4">Memuat data booking...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-accent-bg-soft">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Booking Berhasil!</h1>
          <p className="text-gray-500 mt-2">
            Terima kasih! Pemesanan Anda telah berhasil dibuat.
          </p>
        </motion.div>

        {/* Invoice Card */}
        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-8 mb-6">
              {/* Invoice Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Camera className="w-6 h-6 theme-accent-text" />
                  <span className="font-bold text-gray-900">Invoice</span>
                </div>
                <span className="text-sm font-mono theme-accent-text font-semibold">
                  {booking.invoiceNumber}
                </span>
              </div>

              <hr className="border-gray-100 mb-6" />

              {/* Customer Info */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nama</span>
                  <span className="font-medium text-gray-900">{booking.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-900">{booking.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">WhatsApp</span>
                  <span className="font-medium text-gray-900">{booking.phone}</span>
                </div>
                {booking.eventLocation && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Lokasi Acara</span>
                    <span className="font-medium text-gray-900">{booking.eventLocation}</span>
                  </div>
                )}
              </div>

              <hr className="border-gray-100 mb-4" />

              {/* Package Info */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Paket Foto</p>
                <p className="font-semibold text-gray-900">{booking.package?.name}</p>
                {booking.package?.category && (
                  <p className="text-sm text-gray-500">Kategori: {booking.package.category.name}</p>
                )}
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-gray-50">
                <div className="text-center">
                  <p className="text-2xl font-bold theme-accent-text">
                    {new Date(booking.eventDate).getDate()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.eventDate).toLocaleDateString('id-ID', { month: 'short' })}
                  </p>
                </div>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {new Date(booking.eventDate).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-500">{booking.eventTime} WIB</p>
                </div>
              </div>

              {/* Price Detail */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Harga Paket</span>
                  <span className="font-semibold text-gray-900">{formatPrice(booking.totalPrice)}</span>
                </div>

                {/* Promo & Addon from notes (JSON format) */}
                {(() => {
                  const notes = booking.notes || '';
                  let extra: Record<string, any> | null = null;
                  try {
                    const jsonEnd = notes.indexOf('}');
                    if (jsonEnd >= 0) {
                      const jsonPart = notes.substring(0, jsonEnd + 1);
                      extra = JSON.parse(jsonPart);
                    }
                  } catch {}

                  if (!extra) {
                    const promoMatch = notes.match(/\[Promo: ([^|]+)\| Diskon: ([^\]]+)\]/);
                    const addonMatch = notes.match(/\[Addons: ([^\]]+)\]/);
                    if (promoMatch || addonMatch) {
                      extra = {};
                      if (promoMatch) {
                        extra.promo = promoMatch[1].trim();
                        extra.discount = parseInt(promoMatch[2].replace(/[^0-9]/g, '')) || 0;
                      }
                      if (addonMatch) extra.addons = addonMatch[1].split(',').map((s: string) => s.trim());
                    }
                  }

                  if (!extra || (!extra.promo && !extra.addons)) return null;

                  return (
                    <>
                      {extra.promo && (
                        <div className="flex justify-between text-sm">
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            Diskon {extra.promo}
                          </span>
                          <span className="font-medium text-emerald-600">-{formatPrice(extra.discount || 0)}</span>
                        </div>
                      )}
                      {extra.addons && extra.addons.length > 0 && (
                        <div className="text-sm">
                          <p className="text-gray-500 flex items-center gap-1 mb-1">
                            <PackagePlus className="w-3.5 h-3.5 theme-accent-text" />
                            Layanan Tambahan:
                          </p>
                          <div className="pl-5 space-y-0.5">
                            {extra.addons.map((a: string, i: number) => (
                              <p key={i} className="text-gray-700 text-xs">{a}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}

                <hr className="border-gray-100" />

                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">DP (30%)</span>
                  <span className="font-medium theme-accent-text">{formatPrice(booking.downPayment)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Sisa Pembayaran</span>
                  <span className="font-medium text-gray-900">{formatPrice(booking.remainingPayment)}</span>
                </div>
              </div>

              <hr className="border-gray-100 mb-4" />

              {/* Payment Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status Pembayaran</span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.paymentStatus)}`}>
                  {getStatusLabel(booking.paymentStatus)}
                </span>
              </div>
            </Card>

            {/* Payment Instructions */}
            <Card className="p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Instruksi Pembayaran</h3>
              <div className="space-y-3 text-sm text-gray-600">
                {paymentInstruction ? (
                  <p>{paymentInstruction}</p>
                ) : (
                  <p>1. Lakukan transfer DP sebesar <strong>{formatPrice(booking.downPayment)}</strong> ke rekening yang diinformasikan admin.</p>
                )}
                {paymentMethods.length > 0 && (
                  <div className="grid gap-3">
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="rounded-xl bg-gray-50 px-4 py-3 text-sm">
                        <p className="font-semibold text-gray-900">{method.label}</p>
                        {method.bankName && <p><strong>Bank / Provider:</strong> {method.bankName}</p>}
                        {method.accountName && <p><strong>Atas Nama:</strong> {method.accountName}</p>}
                        {method.accountNumber && <p><strong>No. Rekening / Tujuan:</strong> {method.accountNumber}</p>}
                        {method.instructions && <p className="mt-2 text-gray-600">{method.instructions}</p>}
                      </div>
                    ))}
                  </div>
                )}
                <p>2. Konfirmasi pembayaran dengan mengirim bukti transfer melalui tombol upload bukti pembayaran di bawah ini.</p>
                <p>3. Booking akan dikonfirmasi setelah pembayaran diverifikasi oleh admin.</p>
                <p className="text-xs text-gray-400 mt-2">
                  Atau Anda akan dihubungi admin untuk informasi pembayaran lebih lanjut.
                </p>
              </div>
            </Card>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                to={`/payment?booking=${booking.id}&invoice=${booking.invoiceNumber}`}
                className="w-full"
              >
                <Button variant="gold" className="w-full" size="lg">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Bukti Pembayaran
                </Button>
              </Link>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Cetak
                </Button>
                <Link to="/" className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Kembali ke Beranda
                  </Button>
                </Link>
              </div>
            </div>

            {/* Track booking link */}
            <div className="text-center mt-6">
              <Link to="/track-booking" className="text-sm theme-accent-text hover:opacity-80">
                Lacak status pemesanan Anda &rarr;
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
