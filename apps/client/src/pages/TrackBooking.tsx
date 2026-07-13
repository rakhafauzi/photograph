import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronLeft, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import axios from 'axios';
import type { Booking } from '@/types';
import { toast } from 'sonner';

export default function TrackBooking() {
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/bookings/track', { invoiceNumber, email });
      setBooking(response.data.data);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Booking tidak ditemukan';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const statusSteps = [
    { key: 'pending', label: 'Pending' },
    { key: 'waiting_payment', label: 'Menunggu Pembayaran' },
    { key: 'processed', label: 'Diproses' },
    { key: 'confirmed', label: 'Dikonfirmasi' },
    { key: 'completed', label: 'Selesai' },
  ];

  const getCurrentStep = () => {
    if (!booking) return 0;
    const idx = statusSteps.findIndex((s) => s.key === booking.status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen theme-accent-bg-soft">
      <div className="max-w-lg mx-auto px-4 py-12">
        <button onClick={() => window.history.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ChevronLeft className="w-4 h-4" /> Kembali
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-8">
            <Camera className="w-12 h-12 theme-accent-text mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Lacak Pemesanan</h1>
            <p className="text-gray-500 mt-2">
              Masukkan nomor invoice dan email untuk melacak status pemesanan.
            </p>
          </div>

          {/* Search Form */}
          {!booking && (
            <Card>
              <form onSubmit={handleTrack} className="space-y-4">
                <Input
                  label="Nomor Invoice"
                  placeholder="Contoh: INV-20240101-ABC123"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  variant="gold"
                  className="w-full"
                  isLoading={isLoading}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Lacak Pemesanan
                </Button>
              </form>
            </Card>
          )}

          {/* Booking Result */}
          {booking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Status Timeline */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Status Booking</h2>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {statusSteps.map((step, idx) => {
                    const currentStep = getCurrentStep();
                    const isCompleted = idx <= currentStep;
                    const isCurrent = idx === currentStep;

                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isCompleted ? 'theme-accent-gradient' : 'bg-gray-200'
                        }`}>
                          {isCompleted && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${isCurrent ? 'theme-accent-text' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Booking Info */}
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Detail Pemesanan</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Invoice</span>
                    <span className="font-mono font-semibold text-gray-900">{booking.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paket</span>
                    <span className="font-medium text-gray-900">{booking.package?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tanggal</span>
                    <span className="font-medium text-gray-900">{formatDate(booking.eventDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jam</span>
                    <span className="font-medium text-gray-900">{booking.eventTime} WIB</span>
                  </div>
                  <hr className="border-gray-100" />
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Harga</span>
                    <span className="font-semibold text-gray-900">{formatPrice(booking.totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">DP</span>
                    <span className="font-medium theme-accent-text">{formatPrice(booking.downPayment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status Pembayaran</span>
                    <Badge className={getStatusColor(booking.paymentStatus)}>
                      {getStatusLabel(booking.paymentStatus)}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => { setBooking(null); setInvoiceNumber(''); setEmail(''); }}
              >
                Cari Booking Lain
              </Button>

              <div className="text-center">
                <Link to="/" className="text-sm theme-accent-text hover:opacity-80">
                  Kembali ke Beranda &rarr;
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
