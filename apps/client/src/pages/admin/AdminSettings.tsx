import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Camera, Check, Palette, Plus, Save, Trash2, Type, Wallet } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Card from '@/components/ui/card';
import Skeleton from '@/components/ui/skeleton';
import Select from '@/components/ui/select';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import type { PaymentMethodConfig, WebsiteSettings } from '@/types';
import { toast } from 'sonner';
import { fontOptions, getFontByValue, getPaletteByValue, themePalettes } from '@/lib/theme';
import {
  DEFAULT_BOOKING_TIME_SLOTS,
  getBookingBlackoutDates,
  getBookingTimeSlots,
  getPaymentMethods,
  normalizeDateList,
  normalizeTimeSlots,
} from '@/lib/settings';

const createPaymentMethod = (): PaymentMethodConfig => ({
  id: `payment-method-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  label: '',
  type: 'bank_transfer',
  bankName: '',
  accountName: '',
  accountNumber: '',
  instructions: '',
  isActive: true,
});

export default function AdminSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data, isLoading } = useFetch<WebsiteSettings>(['settings'], '/settings');
  const settings = data?.data || {};

  const updateSetting = useMutationAction<Record<string, string>, any>(
    '/settings',
    'put',
    { successMessage: 'Pengaturan berhasil disimpan', invalidateKeys: [['settings']] }
  );

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [bookingTimeSlots, setBookingTimeSlots] = useState<string[]>(DEFAULT_BOOKING_TIME_SLOTS);
  const [bookingBlackoutDates, setBookingBlackoutDates] = useState<string[]>([]);
  const [newTimeSlot, setNewTimeSlot] = useState('08:00');
  const [newBlackoutDate, setNewBlackoutDate] = useState('');

  const sections = [
    {
      key: 'general',
      label: 'Umum',
      description: 'Profil studio, konten landing, tema visual',
      href: '/admin/settings',
      icon: Palette,
    },
    {
      key: 'payment',
      label: 'Metode Pembayaran',
      description: 'Rekening dan instruksi checkout client',
      href: '/admin/settings/payment',
      icon: Wallet,
    },
    {
      key: 'booking-slots',
      label: 'Slot Booking',
      description: 'Jam booking, blackout date, dan kapasitas slot',
      href: '/admin/settings/booking-slots',
      icon: CalendarDays,
    },
  ] as const;

  const currentSection = location.pathname.includes('/settings/payment')
    ? 'payment'
    : location.pathname.includes('/settings/booking-slots')
    ? 'booking-slots'
    : 'general';

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      setFormData(prev => {
        const merged = { ...prev };
        Object.entries(settings).forEach(([key, value]) => {
          if (!merged[key] && value !== null) {
            merged[key] = value;
          }
        });
        return merged;
      });

      setPaymentMethods((prev) => (
        prev.length > 0 ? prev : getPaymentMethods(settings)
      ));
      setBookingTimeSlots((prev) => (
        prev.length > 0 ? prev : getBookingTimeSlots(settings)
      ));
      setBookingBlackoutDates((prev) => (
        prev.length > 0 ? prev : getBookingBlackoutDates(settings)
      ));
    }
  }, [settings]);

  const handleSave = async () => {
    const normalizedMethods = paymentMethods
      .map((method) => ({
        ...method,
        label: method.label.trim(),
        bankName: method.bankName?.trim() || '',
        accountName: method.accountName?.trim() || '',
        accountNumber: method.accountNumber?.trim() || '',
        instructions: method.instructions?.trim() || '',
      }))
      .filter((method) => method.label);

    const primaryMethod = normalizedMethods.find((method) => method.isActive) || normalizedMethods[0];
    const payload: Record<string, string> = {
      ...formData,
      payment_methods: JSON.stringify(normalizedMethods),
      booking_time_slots: JSON.stringify(normalizeTimeSlots(bookingTimeSlots)),
      booking_blackout_dates: JSON.stringify(normalizeDateList(bookingBlackoutDates)),
      payment_bank_name: primaryMethod?.bankName || '',
      payment_account_name: primaryMethod?.accountName || '',
      payment_account_number: primaryMethod?.accountNumber || '',
      payment_instructions: (formData.payment_instructions || primaryMethod?.instructions || '').trim(),
    };

    const changedSettings = Object.fromEntries(
      Object.entries(payload).filter(([key, value]) => value !== (settings[key] ?? ''))
    );

    if (Object.keys(changedSettings).length === 0) {
      toast.info('Belum ada perubahan untuk disimpan');
      return;
    }

    await updateSetting.mutateAsync(changedSettings);
  };

  const profileFields = [
    { key: 'studio_name', label: 'Nama Studio', type: 'text' },
    { key: 'address', label: 'Alamat', type: 'textarea' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'whatsapp', label: 'Nomor WhatsApp', type: 'text' },
    { key: 'instagram', label: 'Instagram', type: 'text' },
    { key: 'facebook', label: 'Facebook', type: 'text' },
    { key: 'tiktok', label: 'TikTok', type: 'text' },
  ];
  const paymentFields = [
    { key: 'payment_instructions', label: 'Instruksi Pembayaran', type: 'textarea' },
    { key: 'payment_confirmation_note', label: 'Catatan Verifikasi', type: 'textarea' },
  ];

  const selectedPalette = getPaletteByValue(formData.theme_palette || settings.theme_palette);
  const selectedFont = getFontByValue(formData.font_type || settings.font_type);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            {currentSection === 'payment'
              ? 'Metode Pembayaran'
              : currentSection === 'booking-slots'
              ? 'Slot Booking'
              : 'Pengaturan Website'}
          </h1>
          <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">
            {currentSection === 'payment'
              ? 'Kelola rekening tujuan, instruksi checkout, dan sumber pembayaran yang tampil ke client.'
              : currentSection === 'booking-slots'
              ? 'Kelola slot waktu yang tersedia, blackout date, dan batas booking per slot.'
              : 'Kelola identitas studio, tema visual, dan pengaturan operasional website public.'}
          </p>
        </div>
        <Button variant="gold" onClick={handleSave} isLoading={updateSetting.isPending}>
          <Save className="w-4 h-4 mr-2" /> Simpan
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <div className="grid gap-3 md:grid-cols-3">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = currentSection === section.key;

              return (
                <button
                  key={section.key}
                  type="button"
                  onClick={() => navigate(section.href)}
                  className={`rounded-2xl border p-4 text-left transition-all ${
                    isActive
                      ? 'theme-accent-border theme-accent-surface'
                      : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated hover:border-gray-300 dark:hover:border-dark-hover'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'theme-accent-gradient text-white' : 'bg-gray-100 dark:bg-dark-hover text-gray-500 dark:text-dark-text-secondary'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-dark-text">{section.label}</p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-dark-text-secondary">{section.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {currentSection === 'general' && (
          <>
            <Card>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-2xl theme-accent-surface flex items-center justify-center">
                  <Palette className="w-5 h-5 theme-accent-text" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Tema Visual</h2>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Pilih palet warna utama dan jenis font untuk tampilan website dan admin panel.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-dark-text mb-3">Palet Warna</p>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {themePalettes.map((palette) => {
                      const isSelected = (formData.theme_palette || settings.theme_palette || 'gold') === palette.value;

                      return (
                        <button
                          key={palette.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, theme_palette: palette.value })}
                          className={`rounded-2xl border p-4 text-left transition-all ${
                            isSelected
                              ? 'theme-accent-border bg-white dark:bg-dark-elevated shadow-sm'
                              : 'border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated hover:border-gray-300 dark:hover:border-dark-hover'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-dark-text">{palette.label}</p>
                              <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">{palette.description}</p>
                            </div>
                            {isSelected && (
                              <div className="w-7 h-7 rounded-full theme-accent-gradient flex items-center justify-center shadow-theme-accent">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="mt-4 flex items-center gap-2">
                            {palette.preview.map((color) => (
                              <span
                                key={color}
                                className="h-8 flex-1 rounded-xl border border-black/5"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <Select
                      id="font_type"
                      label="Font Type"
                      value={formData.font_type || settings.font_type || 'modern-sans'}
                      onChange={(e) => setFormData({ ...formData, font_type: e.target.value })}
                      options={fontOptions.map((font) => ({ value: font.value, label: font.label }))}
                    />

                    <div className="rounded-2xl border border-gray-200 dark:border-dark-border bg-gray-50/70 dark:bg-dark-hover/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text">
                        <Type className="w-4 h-4" />
                        Mini Preview
                      </div>
                      <div className="mt-4 rounded-2xl border border-white dark:border-dark-border bg-white dark:bg-dark-elevated p-5 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.18em] text-gray-400 dark:text-dark-text-tertiary">Studio Preview</p>
                            <h3
                              className="mt-2 text-xl font-semibold text-gray-900 dark:text-dark-text"
                              style={{ fontFamily: selectedFont.family }}
                            >
                              {formData.studio_name || settings.studio_name || 'Fotografi Studio'}
                            </h3>
                          </div>
                          <div
                            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-white"
                            style={{
                              backgroundImage: `linear-gradient(135deg, ${selectedPalette.vars['--theme-accent-400']}, ${selectedPalette.vars['--theme-accent-500']})`,
                            }}
                          >
                            Aktif
                          </div>
                        </div>

                        <p
                          className="mt-4 text-sm text-gray-500 dark:text-dark-text-secondary"
                          style={{ fontFamily: selectedFont.family }}
                        >
                          {selectedFont.preview}
                        </p>

                        <div className="mt-4 flex items-center gap-2">
                          {selectedPalette.preview.map((color) => (
                            <span
                              key={color}
                              className="h-9 w-9 rounded-xl border border-black/5"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>

                        <p className="mt-4 text-xs text-gray-500 dark:text-dark-text-secondary">{selectedFont.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* ─── Full Visual Preview Panel ─── */}
                  <div className="rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden">
                    <div className="bg-gray-50/80 dark:bg-dark-hover/50 px-5 py-3 border-b border-gray-200 dark:border-dark-border">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-dark-text">
                        <Palette className="w-4 h-4" />
                        Live Preview Panel
                      </div>
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-0.5">
                        Tampilan admin panel dan website dengan tema yang dipilih.
                      </p>
                    </div>

                    <div className="p-5 bg-white dark:bg-dark-elevated">
                      <div className="flex items-center gap-3 mb-5">
                        {/* Device toggles for sub-preview */}
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                          Preview:
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-[10px] font-medium text-gray-700"
                        >
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedPalette.preview[1] }} />
                          Admin Panel
                        </span>
                        <span
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-[10px] font-medium text-gray-700"
                        >
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: selectedPalette.preview[1] }} />
                          Website
                        </span>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        {/* ── Admin Panel Mockup ── */}
                        <div className="rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
                          <div className="flex h-full min-h-[260px]">
                            {/* Sidebar */}
                            <div
                              className="w-14 flex flex-col items-center gap-2 pt-4 pb-3"
                              style={{ backgroundColor: selectedPalette.vars['--theme-accent-50'] }}
                            >
                              <div
                                className="h-7 w-7 rounded-lg flex items-center justify-center"
                                style={{
                                  background: `linear-gradient(135deg, ${selectedPalette.vars['--theme-accent-400']}, ${selectedPalette.vars['--theme-accent-500']})`,
                                }}
                              >
                                <Camera className="h-3.5 w-3.5 text-white" />
                              </div>
                              {[0, 1, 2, 3].map((i) => (
                                <div
                                  key={i}
                                  className="h-6 w-6 rounded-lg"
                                  style={{
                                    backgroundColor:
                                      i === 0
                                        ? selectedPalette.vars['--theme-accent-200']
                                        : 'transparent',
                                    opacity: i === 0 ? 1 : 0.3,
                                    border:
                                      i > 0
                                        ? `1px solid ${selectedPalette.vars['--theme-accent-200']}`
                                        : 'none',
                                  }}
                                />
                              ))}
                            </div>

                            {/* Main content */}
                            <div className="flex-1 p-4 space-y-3" style={{ fontFamily: selectedFont.family }}>
                              {/* Top bar */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-16 rounded-full bg-gray-200 dark:bg-dark-hover" />
                                  <div className="h-2 w-12 rounded-full" style={{ backgroundColor: selectedPalette.vars['--theme-accent-200'] }} />
                                </div>
                                <div
                                  className="h-5 w-5 rounded-full border-2"
                                  style={{ borderColor: selectedPalette.vars['--theme-accent-300'], backgroundColor: selectedPalette.vars['--theme-accent-100'] }}
                                />
                              </div>

                              {/* Stats row */}
                              <div className="grid grid-cols-3 gap-2">
                                {[1, 2, 3].map((s) => (
                                  <div key={s} className="rounded-lg bg-gray-50 dark:bg-dark-hover p-2">
                                    <div className="h-1.5 w-10 rounded-full bg-gray-200 dark:bg-dark-border" />
                                    <div className="mt-1.5 h-3 w-14 rounded-full" style={{ backgroundColor: selectedPalette.vars['--theme-accent-200'] }} />
                                  </div>
                                ))}
                              </div>

                              {/* Table rows */}
                              {[1, 2, 3].map((r) => (
                                <div key={r} className="flex items-center gap-3">
                                  <div
                                    className="h-1.5 flex-1 rounded-full"
                                    style={{ backgroundColor: r === 1 ? selectedPalette.vars['--theme-accent-100'] : '#f0f0f0' }}
                                  />
                                  <div
                                    className="h-4 w-12 rounded-md text-[8px] font-semibold flex items-center justify-center text-white"
                                    style={{
                                      background: `linear-gradient(135deg, ${selectedPalette.vars['--theme-accent-400']}, ${selectedPalette.vars['--theme-accent-500']})`,
                                    }}
                                  >
                                    View
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Bottom label */}
                          <div className="border-t border-gray-100 dark:border-dark-border px-4 py-2 bg-gray-50/50 dark:bg-dark-hover/30">
                            <p className="text-[10px] text-gray-400">
                              <span className="font-semibold" style={{ color: selectedPalette.vars['--theme-accent-600'] }}>
                                {selectedPalette.label}
                              </span>
                              {' '}· Sidebar, navbar, dan aksen menggunakan palet ini
                            </p>
                          </div>
                        </div>

                        {/* ── Website Mockup ── */}
                        <div className="rounded-xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
                          {/* Navbar */}
                          <div className="px-4 py-3" style={{ backgroundColor: selectedPalette.vars['--theme-accent-50'], borderBottom: `1px solid ${selectedPalette.vars['--theme-accent-100']}` }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-6 w-6 rounded-lg flex items-center justify-center"
                                  style={{
                                    background: `linear-gradient(135deg, ${selectedPalette.vars['--theme-accent-400']}, ${selectedPalette.vars['--theme-accent-500']})`,
                                  }}
                                >
                                  <Camera className="h-3 w-3 text-white" />
                                </div>
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: selectedPalette.vars['--theme-accent-800'], fontFamily: selectedFont.family }}
                                >
                                  {formData.studio_name || settings.studio_name || 'Fotografi Studio'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                {['Beranda', 'Paket', 'Kontak'].map((nav) => (
                                  <span key={nav} className="text-[10px]" style={{ color: selectedPalette.vars['--theme-accent-700'] }}>
                                    {nav}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Hero area */}
                          <div className="p-5 space-y-3" style={{ fontFamily: selectedFont.family }}>
                            <div
                              className="inline-flex rounded-full px-2.5 py-0.5 text-[9px] font-semibold"
                              style={{
                                backgroundColor: selectedPalette.vars['--theme-accent-100'],
                                color: selectedPalette.vars['--theme-accent-700'],
                              }}
                            >
                              {selectedPalette.label} Studio
                            </div>
                            <h3
                              className="text-lg font-bold leading-tight"
                              style={{ color: selectedPalette.vars['--theme-accent-900'] }}
                            >
                              {formData.studio_name || settings.studio_name || 'Fotografi Studio'}
                            </h3>
                            <p className="text-[11px] leading-relaxed text-gray-500">
                              {selectedFont.preview}
                            </p>

                            {/* CTA buttons */}
                            <div className="flex gap-2">
                              <div
                                className="rounded-lg px-3 py-1.5 text-[10px] font-semibold text-white"
                                style={{
                                  background: `linear-gradient(135deg, ${selectedPalette.vars['--theme-accent-400']}, ${selectedPalette.vars['--theme-accent-500']})`,
                                }}
                              >
                                Lihat Paket
                              </div>
                              <div
                                className="rounded-lg border-2 px-3 py-1.5 text-[10px] font-semibold"
                                style={{
                                  borderColor: selectedPalette.vars['--theme-accent-200'],
                                  color: selectedPalette.vars['--theme-accent-700'],
                                }}
                              >
                                Konsultasi
                              </div>
                            </div>

                            {/* Palette colors bar */}
                            <div className="flex items-center gap-1.5 pt-1">
                              {selectedPalette.preview.map((color) => (
                                <span
                                  key={color}
                                  className="h-5 flex-1 rounded-md border border-black/5"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                              <span className="text-[9px] text-gray-400 ml-1">
                                {selectedPalette.description}
                              </span>
                            </div>
                          </div>

                          {/* Bottom label */}
                          <div className="border-t border-gray-100 dark:border-dark-border px-4 py-2 bg-gray-50/50 dark:bg-dark-hover/30">
                            <p className="text-[10px] text-gray-400">
                              Font:{' '}
                              <span className="font-semibold text-gray-600">
                                {selectedFont.label}
                              </span>
                              {' · '}
                              <span
                                className="font-semibold"
                                style={{ color: selectedPalette.vars['--theme-accent-600'] }}
                              >
                                {selectedPalette.label}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Profil Studio & SEO</h2>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Informasi dasar studio, sosial media, dan metadata website.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {profileFields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    {field.type === 'textarea' ? (
                      <Textarea
                        label={field.label}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                      />
                    ) : (
                      <Input
                        label={field.label}
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>

          </>
        )}

        {currentSection === 'payment' && (
          <>
            <Card>
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Daftar Metode Pembayaran</h2>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Metode aktif akan muncul di checkout dan form upload pembayaran client.</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPaymentMethods((prev) => [...prev, createPaymentMethod()])}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Metode
                </Button>
              </div>

              <div className="space-y-4">
                {paymentMethods.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-border p-6 text-sm text-gray-500 dark:text-dark-text-secondary">
                    Belum ada metode pembayaran. Tambahkan minimal satu metode agar client tahu ke rekening atau kanal mana pembayaran dikirim.
                  </div>
                )}

                {paymentMethods.map((method, index) => (
                  <div key={method.id} className="rounded-2xl border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-elevated p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-dark-text">Metode #{index + 1}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-text-secondary">Contoh: Transfer BCA, Transfer Mandiri, E-Wallet, atau pembayaran on-site.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethods((prev) => prev.map((item) => item.id === method.id ? { ...item, isActive: !item.isActive } : item))}
                          className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                            method.isActive
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {method.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethods((prev) => prev.filter((item) => item.id !== method.id))}
                          className="rounded-xl p-2 text-gray-400 dark:text-dark-text-tertiary transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                          title="Hapus metode"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Label Metode"
                        value={method.label}
                        onChange={(e) => setPaymentMethods((prev) => prev.map((item) => item.id === method.id ? { ...item, label: e.target.value } : item))}
                        placeholder="Transfer Bank BCA"
                      />
                      <Select
                        label="Jenis Metode"
                        value={method.type}
                        onChange={(e) => setPaymentMethods((prev) => prev.map((item) => item.id === method.id ? { ...item, type: e.target.value as PaymentMethodConfig['type'] } : item))}
                        options={[
                          { value: 'bank_transfer', label: 'Transfer Bank' },
                          { value: 'ewallet', label: 'E-Wallet' },
                          { value: 'cash', label: 'Cash / On Site' },
                          { value: 'other', label: 'Lainnya' },
                        ]}
                      />
                      <Input
                        label="Nama Bank / Provider"
                        value={method.bankName || ''}
                        onChange={(e) => setPaymentMethods((prev) => prev.map((item) => item.id === method.id ? { ...item, bankName: e.target.value } : item))}
                        placeholder="BCA / QRIS / OVO"
                      />
                      <Input
                        label="Atas Nama"
                        value={method.accountName || ''}
                        onChange={(e) => setPaymentMethods((prev) => prev.map((item) => item.id === method.id ? { ...item, accountName: e.target.value } : item))}
                        placeholder="Fotografi Studio"
                      />
                      <Input
                        label="Nomor Rekening / Nomor Tujuan"
                        value={method.accountNumber || ''}
                        onChange={(e) => setPaymentMethods((prev) => prev.map((item) => item.id === method.id ? { ...item, accountNumber: e.target.value } : item))}
                        placeholder="1234567890"
                      />
                      <div className="rounded-2xl bg-gray-50 dark:bg-dark-hover p-4 text-sm text-gray-600 dark:text-dark-text-secondary">
                        <p className="font-medium text-gray-900 dark:text-dark-text">Preview Ringkas</p>
                        <p className="mt-2">{method.label || 'Nama metode belum diisi'}</p>
                        <p>{method.bankName || 'Provider belum diisi'}</p>
                        <p>{method.accountName || 'Atas nama belum diisi'}</p>
                        <p>{method.accountNumber || 'Nomor tujuan belum diisi'}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Textarea
                          label="Instruksi Khusus Metode"
                          value={method.instructions || ''}
                          onChange={(e) => setPaymentMethods((prev) => prev.map((item) => item.id === method.id ? { ...item, instructions: e.target.value } : item))}
                          placeholder="Contoh: Cantumkan invoice di berita transfer."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Instruksi Global Pembayaran</h2>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Ditampilkan di checkout dan upload bukti pembayaran, berlaku untuk semua metode yang aktif.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {paymentFields.map((field) => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    {field.type === 'textarea' ? (
                      <Textarea
                        label={field.label}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                      />
                    ) : (
                      <Input
                        label={field.label}
                        type={field.type}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        placeholder={`Masukkan ${field.label.toLowerCase()}...`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}

        {currentSection === 'booking-slots' && (
          <>
            <Card>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Jam Slot Booking</h2>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Daftar slot waktu aktif yang akan dipakai halaman booking client dan validasi backend saat booking dibuat.</p>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <Input
                  label="Tambah Jam"
                  type="time"
                  value={newTimeSlot}
                  onChange={(e) => setNewTimeSlot(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!newTimeSlot) return;
                    setBookingTimeSlots((prev) => normalizeTimeSlots([...prev, newTimeSlot]));
                    setNewTimeSlot('');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Slot
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {bookingTimeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setBookingTimeSlots((prev) => prev.filter((item) => item !== slot))}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-hover px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                  >
                    <span>{slot}</span>
                    <Trash2 className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Aturan Ketersediaan Booking</h2>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Pengaturan ini dipakai client saat memilih tanggal dan juga divalidasi kembali di backend.</p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <Input
                  label="Maksimum Booking per Slot"
                  type="number"
                  min="1"
                  value={formData.booking_max_per_slot || settings.booking_max_per_slot || '1'}
                  onChange={(e) => setFormData({ ...formData, booking_max_per_slot: e.target.value })}
                />
                <Input
                  label="Jendela Booking (hari)"
                  type="number"
                  min="1"
                  value={formData.booking_window_days || settings.booking_window_days || '30'}
                  onChange={(e) => setFormData({ ...formData, booking_window_days: e.target.value })}
                />
                <Input
                  label="Minimal Notice (hari)"
                  type="number"
                  min="0"
                  value={formData.booking_advance_notice_days || settings.booking_advance_notice_days || '0'}
                  onChange={(e) => setFormData({ ...formData, booking_advance_notice_days: e.target.value })}
                />
              </div>
            </Card>

            <Card>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">Blackout Date</h2>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">Tanggal yang ditutup total untuk booking, misalnya hari libur studio atau maintenance.</p>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <Input
                  label="Tambah Tanggal Tutup"
                  type="date"
                  value={newBlackoutDate}
                  onChange={(e) => setNewBlackoutDate(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (!newBlackoutDate) return;
                    setBookingBlackoutDates((prev) => normalizeDateList([...prev, newBlackoutDate]));
                    setNewBlackoutDate('');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Tanggal
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {bookingBlackoutDates.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-gray-200 dark:border-dark-border px-4 py-3 text-sm text-gray-500 dark:text-dark-text-secondary">
                    Belum ada blackout date. Semua tanggal mengikuti slot normal.
                  </div>
                )}

                {bookingBlackoutDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => setBookingBlackoutDates((prev) => prev.filter((item) => item !== date))}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-hover px-3 py-2 text-sm font-medium text-gray-700 dark:text-dark-text hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                  >
                    <span>{date}</span>
                    <Trash2 className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </motion.div>
  );
}
