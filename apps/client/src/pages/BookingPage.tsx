import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight, Check, Clock, MapPin, Users, Calendar as CalendarIcon, Tag, PackagePlus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import type { Category, Package, WebsiteSettings } from '@/types';
import { toast } from 'sonner';
import {
  getActiveBookingWindowDays,
  getBookingAdvanceNoticeDays,
  getBookingMaxPerSlot,
  getBookingTimeSlots,
} from '@/lib/settings';

const bookingSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(8, 'Nomor WA minimal 8 digit'),
  address: z.string().optional(),
  eventLocation: z.string().optional(),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function BookingPage() {
  const { packageSlug } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
  const [availableAddons, setAvailableAddons] = useState<any[]>([]);

  // Fetch categories
  const { data: categoriesData, isLoading: loadingCategories } = useFetch<Category[]>(
    ['categories-booking'],
    '/categories?all=true'
  );
  const categories = categoriesData?.data || [];

  // Fetch all active packages published from admin
  const { data: packagesData, isLoading: loadingPackages } = useFetch<Package[]>(
    ['packages-booking'],
    '/packages?all=true'
  );
  const allPackages = packagesData?.data || [];

  const { data: settingsData } = useFetch<WebsiteSettings>(['booking-settings'], '/settings');
  const bookingSettings = settingsData?.data || {};
  const bookingTimeSlots = getBookingTimeSlots(bookingSettings);
  const bookingWindowDays = getActiveBookingWindowDays(bookingSettings);
  const bookingAdvanceNoticeDays = getBookingAdvanceNoticeDays(bookingSettings);
  const bookingMaxPerSlot = getBookingMaxPerSlot(bookingSettings);

  // Parse addons and promos from settings
  useEffect(() => {
    try {
      const bs = bookingSettings as any;
      const addonsRaw = bs.addons;
      if (addonsRaw) {
        const parsed = JSON.parse(addonsRaw);
        if (Array.isArray(parsed)) {
          setAvailableAddons(parsed.filter((a: any) => a.isActive));
        }
      }
    } catch {}
  }, [bookingSettings]);
  const blackoutDates = new Set(
    (() => {
      try {
        return JSON.parse(bookingSettings.booking_blackout_dates || '[]') as string[];
      } catch {
        return [] as string[];
      }
    })()
  );

  // Fetch booked dates
  const today = dayjs().add(bookingAdvanceNoticeDays, 'day').startOf('day');
  const endDate = today.add(Math.max(bookingWindowDays - 1, 0), 'day').endOf('day');
  const { data: bookedDatesData } = useFetch<Record<string, string[]>>(
    ['booked-dates', today.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD')],
    `/bookings/available-dates?startDate=${today.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}`
  );
  const bookedDates = bookedDatesData?.data || {};

  // Deep-link support for category slug or package slug
  const matchedCategory = packageSlug
    ? categories.find((category) => category.slug === packageSlug)
    : null;
  const matchedPackage = packageSlug
    ? allPackages.find((pkg) => pkg.slug === packageSlug)
    : null;
  const selectedCategoryData = categories.find((category) => category.id === selectedCategory);
  const packages = selectedCategory
    ? allPackages.filter((pkg) => pkg.categoryId === selectedCategory)
    : [];

  useEffect(() => {
    if (!packageSlug) return;

    if (matchedPackage) {
      setSelectedCategory(matchedPackage.categoryId);
      setSelectedPackage(matchedPackage);
      setStep(3);
      return;
    }

    if (matchedCategory) {
      setSelectedCategory(matchedCategory.id);
      setSelectedPackage(null);
      setStep(2);
    }
  }, [matchedCategory, matchedPackage, packageSlug]);

  // Form
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      eventLocation: '',
      notes: '',
    },
  });

  // Create booking mutation
  const createBooking = useMutationAction<any, any>(
    '/bookings',
    'post',
    {
      successMessage: 'Booking berhasil dibuat!',
      onSuccess: (data) => {
        navigate(`/checkout?booking=${data.id}&invoice=${data.invoiceNumber}`);
      },
    }
  );

  const getBookedCountForSlot = (date: string, time: string) => {
    return bookedDates[date]?.filter((slot) => slot === time).length || 0;
  };

  const isSlotDisabled = (date: string, time: string) => {
    if (!date) return true;
    if (blackoutDates.has(date)) return true;
    return getBookedCountForSlot(date, time) >= bookingMaxPerSlot;
  };

  const isDateDisabled = (date: string) => {
    const dateStr = dayjs(date).format('YYYY-MM-DD');

    if (blackoutDates.has(dateStr)) return true;
    if (bookingTimeSlots.length === 0) return true;

    return bookingTimeSlots.every((time) => getBookedCountForSlot(dateStr, time) >= bookingMaxPerSlot);
  };

  useEffect(() => {
    if (selectedDate && isDateDisabled(selectedDate)) {
      setSelectedDate('');
      setSelectedTime('');
    }
  }, [bookedDatesData, bookingSettings, selectedDate]);

  useEffect(() => {
    if (selectedDate && selectedTime && isSlotDisabled(selectedDate, selectedTime)) {
      setSelectedTime('');
    }
  }, [selectedDate, selectedTime, bookedDatesData, bookingSettings]);

  const handleSubmit = async () => {
    if (!selectedPackage || !selectedDate || !selectedTime) return;

    const formData = form.getValues();
    const addonTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0);

    // Build extra data as JSON
    const extra: Record<string, any> = {};
    if (appliedPromo) {
      extra.promo = appliedPromo.code;
      extra.discount = promoDiscount;
    }
    if (selectedAddons.length > 0) {
      extra.addons = selectedAddons.map((a) => `${a.name} (${formatPrice(a.price)})`);
    }

    const extraJson = Object.keys(extra).length > 0 ? JSON.stringify(extra) : '';
    const enrichedNotes = extraJson
      ? `${extraJson} | ${formData.notes || ''}`
      : formData.notes || '';

    await createBooking.mutateAsync({
      packageId: selectedPackage.id,
      ...formData,
      notes: enrichedNotes,
      eventDate: selectedDate,
      eventTime: selectedTime,
    });
  };

  // Generate available dates (next 30 days)
  const availableDates = Array.from({ length: bookingWindowDays }, (_, i) => {
    const date = today.add(i, 'day');
    return {
      value: date.format('YYYY-MM-DD'),
      label: date.format('dddd, DD MMM YYYY'),
      disabled: isDateDisabled(date.format('YYYY-MM-DD')),
      isBlackout: blackoutDates.has(date.format('YYYY-MM-DD')),
    };
  });

  return (
    <div className="min-h-screen theme-accent-bg-soft">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-100">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-semibold text-gray-900">Booking Paket Foto</h1>
            <p className="text-sm text-gray-500">Isi data untuk melanjutkan pemesanan</p>
          </div>
        </div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  s <= step ? 'theme-accent-gradient text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                {s < 4 && <div className={`flex-1 h-0.5 transition-colors ${s < step ? 'theme-accent-gradient' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* STEP 1: Pilih Kategori */}
        {step === 1 && (
          <motion.div {...fadeIn}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Kategori</h2>
            <p className="text-gray-500 mb-8">Pilih kategori foto yang sesuai dengan kebutuhan Anda.</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <Card
                  key={cat.id}
                  hover
                  className={`p-6 ${selectedCategory === cat.id ? 'theme-accent-selected' : ''}`}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedPackage(null);
                    setSelectedDate('');
                    setSelectedTime('');
                    setStep(2);
                  }}
                >
                  <div className="w-12 h-12 rounded-xl theme-accent-bg-soft-strong flex items-center justify-center mb-3">
                    <Camera className="w-6 h-6 theme-accent-text" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                  {cat.description && (
                    <p className="text-sm text-gray-500 mt-1">{cat.description}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">{cat._count?.packages || 0} Paket</p>
                </Card>
              ))}
            </div>
            {!loadingCategories && categories.length === 0 && (
              <Card className="p-8 text-center text-gray-500">
                Belum ada kategori paket yang dipublikasikan dari admin panel.
              </Card>
            )}
          </motion.div>
        )}

        {/* STEP 2: Pilih Paket */}
        {step === 2 && (
          <motion.div {...fadeIn}>
            <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Paket</h2>
            <p className="text-gray-500 mb-8">Pilih paket yang paling sesuai dengan kebutuhan Anda.</p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  hover
                  className={`relative p-0 overflow-hidden ${selectedPackage?.id === pkg.id ? 'theme-accent-selected' : ''}`}
                  onClick={() => { setSelectedPackage(pkg); setStep(3); }}
                >
                  {pkg.isPopular && (
                    <div className="absolute top-3 right-3 z-10">
                      <Badge variant="gold">Popular</Badge>
                    </div>
                  )}

                  <div className="p-6">
                    <p className="text-sm theme-accent-text font-medium">{pkg.category?.name || selectedCategoryData?.name}</p>
                    <h3 className="text-lg font-semibold text-gray-900 mt-1">{pkg.name}</h3>
                    <p className="text-2xl font-bold text-gradient-gold mt-2">{formatPrice(pkg.price)}</p>

                    <div className="mt-4 space-y-2">
                      {pkg.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{pkg.duration}</span>
                        </div>
                      )}
                      {pkg.photographer && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Users className="w-4 h-4" />
                          <span>{pkg.photographer} Fotografer</span>
                        </div>
                      )}
                      {pkg.photoCount && pkg.photoCount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Check className="w-4 h-4 text-emerald-500" />
                          <span>{pkg.photoCount} Foto</span>
                        </div>
                      )}
                    </div>

                    {pkg.benefits && pkg.benefits.length > 0 && (
                      <div className="mt-4 space-y-1.5">
                        {pkg.benefits.slice(0, 3).map((b) => (
                          <div key={b.id} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 theme-accent-text mt-0.5 shrink-0" />
                            <span>{b.benefit}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            {!loadingPackages && packages.length === 0 && (
              <Card className="p-8 text-center text-gray-500">
                Belum ada paket aktif pada kategori ini. Silakan pilih kategori lain atau lengkapi data paket dari admin panel.
              </Card>
            )}
          </motion.div>
        )}

        {/* STEP 3: Pilih Tanggal & Jam */}
        {step === 3 && (
          <motion.div {...fadeIn}>
            <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pilih Tanggal & Jam</h2>
            <p className="text-gray-500 mb-8">Pilih tanggal dan jam pelaksanaan foto.</p>

            <Card className="mb-6 bg-gray-50">
              <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Slot Aktif</p>
                  <p className="mt-1 font-medium text-gray-900">{bookingTimeSlots.length} slot per hari</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Batas Booking</p>
                  <p className="mt-1 font-medium text-gray-900">{bookingMaxPerSlot} booking per slot</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-400">Jendela Booking</p>
                  <p className="mt-1 font-medium text-gray-900">{bookingWindowDays} hari ke depan</p>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Tanggal</label>
                <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {availableDates.map((date) => (
                    <button
                      key={date.value}
                      disabled={date.disabled}
                      onClick={() => setSelectedDate(date.value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                        selectedDate === date.value
                          ? 'theme-accent-selected'
                          : date.disabled
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 theme-accent-hover-border'
                      }`}
                    >
                      <CalendarIcon className={`w-5 h-5 ${selectedDate === date.value ? 'theme-accent-text' : date.disabled ? 'text-gray-300' : 'text-gray-400'}`} />
                      <div>
                        <span className={`text-sm font-medium ${date.disabled ? '' : 'text-gray-900'}`}>{date.label}</span>
                        {date.disabled && (
                          <span className="text-xs ml-2 text-red-400">
                            {date.isBlackout ? '(Tutup)' : '(Penuh)'}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Jam</label>
                <div className="grid grid-cols-3 gap-3">
                  {bookingTimeSlots.map((time) => {
                    const disabled = isSlotDisabled(selectedDate, time);

                    return (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      disabled={disabled}
                      className={`p-3 rounded-xl border text-center text-sm font-medium transition-all ${
                        selectedTime === time
                          ? 'theme-accent-selected theme-accent-text'
                          : disabled
                          ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          : 'border-gray-200 theme-accent-hover-border text-gray-700'
                      }`}
                    >
                      {time}
                    </button>
                  )})}
                </div>
                {selectedDate && bookingTimeSlots.length === 0 && (
                  <p className="mt-3 text-sm text-red-500">Belum ada slot waktu aktif. Atur dulu di admin panel.</p>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                variant="gold"
                size="lg"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(4)}
              >
                Lanjutkan <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Isi Data & Checkout */}
        {step === 4 && (
          <motion.div {...fadeIn}>
            <button onClick={() => setStep(3)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
              <ChevronLeft className="w-4 h-4" /> Kembali
            </button>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Form */}
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Lengkapi Data</h2>
                <p className="text-gray-500 mb-8">Isi data diri Anda untuk konfirmasi pemesanan.</p>

                <form className="space-y-5">
                  <Input
                    label="Nama Lengkap"
                    placeholder="Masukkan nama lengkap"
                    error={form.formState.errors.name?.message}
                    {...form.register('name')}
                  />

                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      placeholder="email@example.com"
                      error={form.formState.errors.email?.message}
                      {...form.register('email')}
                    />
                    <Input
                      label="Nomor WhatsApp"
                      placeholder="6281234567890"
                      error={form.formState.errors.phone?.message}
                      {...form.register('phone')}
                    />
                  </div>

                  <Input
                    label="Alamat"
                    placeholder="Masukkan alamat lengkap"
                    {...form.register('address')}
                  />

                  <Input
                    label="Lokasi Acara"
                    placeholder="Masukkan lokasi acara"
                    {...form.register('eventLocation')}
                  />

                  {/* Promo Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Promo</label>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          placeholder="Masukkan kode promo"
                          value={promoCode}
                          onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant={appliedPromo ? 'outline' : 'gold'}
                        onClick={() => {
                          if (appliedPromo) {
                            setAppliedPromo(null);
                            setPromoDiscount(0);
                            setPromoCode('');
                            setPromoError('');
                            return;
                          }
                          if (!promoCode) { setPromoError('Masukkan kode promo'); return; }

                          try {
                            const bs = bookingSettings as any;
                            const promosRaw = bs.promos;
                            if (promosRaw) {
                              const allPromos = JSON.parse(promosRaw);
                              if (Array.isArray(allPromos)) {
                                const found = allPromos.find((p: any) => p.code === promoCode && p.isActive);
                                if (!found) {
                                  setPromoError('Kode promo tidak valid');
                                  return;
                                }
                                if (dayjs(found.endDate).isBefore(dayjs())) {
                                  setPromoError('Kode promo sudah kedaluwarsa');
                                  return;
                                }
                                if (found.used >= found.quota) {
                                  setPromoError('Kuota promo sudah habis');
                                  return;
                                }
                                if (!selectedPackage) return;
                                let discount = 0;
                                if (found.type === 'percentage') {
                                  discount = selectedPackage.price * (found.value / 100);
                                  if (found.maxDiscount > 0 && discount > found.maxDiscount) {
                                    discount = found.maxDiscount;
                                  }
                                } else {
                                  discount = found.value;
                                }
                                setAppliedPromo(found);
                                setPromoDiscount(discount);
                                setPromoError('');
                              }
                            }
                          } catch { setPromoError('Gagal memvalidasi promo'); }
                        }}
                      >
                        {appliedPromo ? (
                          <><X className="w-4 h-4 mr-1" /> Hapus</>
                        ) : (
                          <Tag className="w-4 h-4 mr-1" />
                        )}
                        {appliedPromo ? '' : 'Pakai'}
                      </Button>
                    </div>
                    {promoError && <p className="mt-1 text-xs text-red-500">{promoError}</p>}
                    {appliedPromo && (
                      <p className="mt-1 text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Diskon {appliedPromo.type === 'percentage' ? `${appliedPromo.value}%` : formatPrice(appliedPromo.value)} berhasil diterapkan!
                      </p>
                    )}
                  </div>

                  {/* Add-ons */}
                  {availableAddons.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Layanan Tambahan (Opsional)</label>
                      <div className="grid gap-3">
                        {availableAddons.map((addon: any) => {
                          const isSelected = selectedAddons.some((a) => a.id === addon.id);
                          return (
                            <button
                              key={addon.id}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  setSelectedAddons(selectedAddons.filter((a) => a.id !== addon.id));
                                } else {
                                  setSelectedAddons([...selectedAddons, addon]);
                                }
                              }}
                              className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                                isSelected
                                  ? 'theme-accent-selected'
                                  : 'border-gray-200 hover:border-gray-300 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  isSelected ? 'theme-accent-bg-soft-strong' : 'bg-gray-100'
                                }`}>
                                  <PackagePlus className={`w-4 h-4 ${isSelected ? 'theme-accent-text' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{addon.name}</p>
                                  {addon.description && (
                                    <p className="text-xs text-gray-500">{addon.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-gray-900 text-sm">{formatPrice(addon.price)}</span>
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected ? 'theme-accent-border theme-accent-bg-soft-strong' : 'border-gray-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 theme-accent-text" />}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <Textarea
                    label="Catatan (Opsional)"
                    placeholder="Tambahkan catatan jika ada..."
                    {...form.register('notes')}
                  />
                </form>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <h3 className="font-semibold text-gray-900 mb-4">Ringkasan Pesanan</h3>

                  {selectedPackage && (
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <Camera className="w-8 h-8 theme-accent-text" />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{selectedPackage.name}</p>
                          <p className="text-xs text-gray-500">{selectedCategoryData?.name}</p>
                        </div>
                      </div>

                      {selectedDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{dayjs(selectedDate).format('DD MMM YYYY')}</span>
                        </div>
                      )}

                      {selectedTime && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{selectedTime} WIB</span>
                        </div>
                      )}

                      <hr className="border-gray-100" />

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Harga Paket</span>
                        <span className="font-semibold text-gray-900">{formatPrice(selectedPackage.price)}</span>
                      </div>

                      {/* Selected Add-ons */}
                      {selectedAddons.map((addon) => (
                        <div key={addon.id} className="flex justify-between items-center text-sm">
                          <span className="text-gray-500 flex items-center gap-1">
                            <PackagePlus className="w-3.5 h-3.5 theme-accent-text" />
                            {addon.name}
                          </span>
                          <span className="font-medium text-gray-900">+{formatPrice(addon.price)}</span>
                        </div>
                      ))}

                      {/* Promo Discount */}
                      {appliedPromo && promoDiscount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            Diskon {appliedPromo.code}
                          </span>
                          <span className="font-medium text-emerald-600">-{formatPrice(promoDiscount)}</span>
                        </div>
                      )}

                      <hr className="border-gray-100" />

                      {/* Total */}
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-bold text-gradient-gold">
                          {formatPrice(Math.max(0, selectedPackage.price + selectedAddons.reduce((sum, a) => sum + a.price, 0) - promoDiscount))}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">DP (30%)</span>
                        <span className="font-medium text-gray-900">
                          {formatPrice(Math.max(0, (selectedPackage.price + selectedAddons.reduce((sum, a) => sum + a.price, 0) - promoDiscount) * 0.3))}
                        </span>
                      </div>

                      <hr className="border-gray-100" />

                      <Button
                        variant="gold"
                        size="lg"
                        className="w-full"
                        isLoading={createBooking.isPending}
                        onClick={handleSubmit}
                      >
                        Booking Sekarang
                      </Button>

                      <p className="text-xs text-gray-400 text-center">
                        Pembayaran DP 30% setelah booking dikonfirmasi
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
