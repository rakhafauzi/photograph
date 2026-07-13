import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Wallet,
  Camera,
  Images,
  Users,
  Settings,
  ChevronDown,
  Search,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Info,
  MousePointerClick,
  LayoutDashboard,
  FolderKanban,
  Star,
  BarChart3,
  Globe,
  FileText,
  Phone,
  Mail,
} from 'lucide-react';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface GuideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  content: GuideContent[];
}

interface GuideContent {
  title: string;
  description: string;
  steps?: string[];
  tips?: string[];
  warnings?: string[];
}

const guideSections: GuideSection[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
    color: 'blue',
    content: [
      {
        title: 'Overview Dashboard',
        description: 'Dashboard utama menampilkan ringkasan penting bisnis fotografi Anda.',
        steps: [
          'Akses dashboard dari menu sidebar "Dashboard"',
          'Lihat total booking, pendapatan, dan statistik bulanan',
          'Cek booking baru yang menunggu diproses',
          'Monitor jadwal shooting hari ini',
        ],
        tips: [
          'Periksa dashboard setiap hari untuk memantau perkembangan bisnis',
          'Gunakan filter tanggal untuk melihat laporan periode tertentu',
        ],
      },
    ],
  },
  {
    id: 'bookings',
    title: 'Manajemen Booking',
    icon: <Calendar className="w-5 h-5" />,
    color: 'green',
    content: [
      {
        title: 'Mengelola Booking',
        description: 'Kelola semua pesanan dari customer dengan mudah.',
        steps: [
          'Buka menu "Booking" → "Semua Booking" untuk melihat daftar booking',
          'Gunakan filter status untuk melihat booking tertentu (pending, confirmed, completed)',
          'Klik nomor invoice untuk melihat detail booking',
          'Update status booking sesuai progress',
          'Gunakan "Kalender Booking" untuk melihat jadwal dalam bentuk kalender',
        ],
        tips: [
          'Periksa "Booking Baru" secara berkala untuk merespon customer',
          'Setelah pembayaran diverifikasi, update status ke "confirmed"',
          'Jangan lupa update status ke "completed" setelah shooting selesai',
        ],
        warnings: [
          'Pastikan untuk selalu cek ketersediaan tanggal sebelum konfirmasi booking',
          'Hindari double booking dengan memeriksa kalender terlebih dahulu',
        ],
      },
    ],
  },
  {
    id: 'payments',
    title: 'Pembayaran',
    icon: <Wallet className="w-5 h-5" />,
    color: 'yellow',
    content: [
      {
        title: 'Verifikasi Pembayaran',
        description: 'Proses dan verifikasi pembayaran dari customer.',
        steps: [
          'Buka menu "Pembayaran" → "Menunggu Verifikasi"',
          'Klik pembayaran untuk melihat detail (bukti transfer, jumlah, rekening)',
          'Bandingkan bukti transfer dengan jumlah yang tertera',
          'Klik "Verifikasi" jika pembayaran valid, atau "Tolak" jika ada masalah',
          'Tambahkan catatan jika diperlukan',
        ],
        tips: [
          'Selalu cocokkan jumlah transfer dengan tagihan',
          'Simpan bukti verifikasi untuk dokumentasi',
          'Hubungi customer jika ada ketidaksesuaian data',
        ],
        warnings: [
          'Jangan verifikasi pembayaran tanpa memeriksa bukti transfer terlebih dahulu',
          'Pastikan nama pengirim sesuai dengan data booking',
        ],
      },
    ],
  },
  {
    id: 'packages',
    title: 'Paket Fotografi',
    icon: <Camera className="w-5 h-5" />,
    color: 'purple',
    content: [
      {
        title: 'Mengelola Kategori & Paket',
        description: 'Buat dan kelola paket layanan fotografi.',
        steps: [
          'Buka "Paket Fotografi" → "Kategori Paket" untuk mengelola kategori',
          'Klik "Tambah Kategori" untuk menambah kategori baru (Wedding, Wisuda, dll)',
          'Buka "Paket Fotografi" untuk mengelola paket dalam setiap kategori',
          'Isi detail paket: nama, harga, durasi, fasilitas',
          'Atur fitur yang tersedia (drone, album, cetak, frame, cinematic)',
        ],
        tips: [
          'Buat deskripsi yang jelas dan menarik untuk setiap paket',
          'Tandai paket populer dengan fitur "Popular"',
          'Upload foto gallery untuk setiap paket',
        ],
      },
    ],
  },
  {
    id: 'portfolios',
    title: 'Portfolio',
    icon: <Images className="w-5 h-5" />,
    color: 'pink',
    content: [
      {
        title: 'Mengelola Portfolio',
        description: 'Tampilkan hasil karya terbaik Anda.',
        steps: [
          'Buka menu "Portfolio" → "Album"',
          'Klik "Tambah Portfolio" untuk membuat album baru',
          'Isi judul, deskripsi, dan pilih kategori',
          'Upload cover image sebagai foto sampul',
          'Tambahkan foto-foto ke dalam album',
          'Atur urutan foto dengan drag & drop',
        ],
        tips: [
          'Upload foto berkualitas tinggi untuk menarik customer',
          'Buat album berdasarkan kategori atau jenis foto',
          'Update portfolio secara berkala dengan karya terbaru',
        ],
      },
    ],
  },
  {
    id: 'customers',
    title: 'Customer',
    icon: <Users className="w-5 h-5" />,
    color: 'indigo',
    content: [
      {
        title: 'Mengelola Customer',
        description: 'Lihat dan kelola data customer.',
        steps: [
          'Buka menu "Customer" → "Semua Customer"',
          'Gunakan pencarian untuk menemukan customer tertentu',
          'Klik nama customer untuk melihat detail dan riwayat booking',
          'Lihat riwayat booking di menu "Riwayat Booking"',
        ],
        tips: [
          'Jaga hubungan baik dengan customer untuk repeat order',
          'Catat preferensi customer untuk pelayanan yang lebih personal',
        ],
      },
    ],
  },
  {
    id: 'projects',
    title: 'Project',
    icon: <FolderKanban className="w-5 h-5" />,
    color: 'teal',
    content: [
      {
        title: 'Tracking Project',
        description: 'Pantau progress setiap project dari shooting hingga delivery.',
        steps: [
          'Buka menu "Project" untuk melihat semua project',
          'Gunakan filter status: Shooting → Editing → Preview → Printing → Delivery → Completed',
          'Update status project sesuai progress aktual',
          'Catat deadline untuk setiap tahapan',
        ],
        tips: [
          'Update status secara berkala agar customer bisa memantau progress',
          'Set reminder untuk deadline editing dan delivery',
        ],
        warnings: [
          'Pastikan semua file backup tersimpan sebelum mengubah status ke Completed',
        ],
      },
    ],
  },
  {
    id: 'testimonials',
    title: 'Testimoni',
    icon: <Star className="w-5 h-5" />,
    color: 'amber',
    content: [
      {
        title: 'Mengelola Testimoni',
        description: 'Moderasi dan tampilkan testimoni dari customer.',
        steps: [
          'Buka menu "Testimoni" → "Semua Testimoni"',
          'Cek "Menunggu Persetujuan" untuk testimoni baru',
          'Klik testimoni untuk melihat detail',
          'Setujui atau tolak testimoni',
        ],
        tips: [
          'Tampilkan testimoni terbaik di website',
          'Balas testimoni customer untuk meningkatkan engagement',
        ],
      },
    ],
  },
  {
    id: 'reports',
    title: 'Laporan',
    icon: <BarChart3 className="w-5 h-5" />,
    color: 'red',
    content: [
      {
        title: 'Melihat Laporan',
        description: 'Analisis performa bisnis Anda.',
        steps: [
          'Buka menu "Laporan" untuk melihat berbagai jenis laporan',
          'Pilih laporan: Pendapatan, Booking, Paket Terlaris, Customer Terbanyak',
          'Filter berdasarkan periode waktu (bulanan/tahunan)',
          'Export laporan jika diperlukan',
        ],
        tips: [
          'Gunakan laporan untuk mengambil keputusan bisnis',
          'Analisis tren untuk merencanakan strategi marketing',
        ],
      },
    ],
  },
  {
    id: 'settings',
    title: 'Pengaturan',
    icon: <Settings className="w-5 h-5" />,
    color: 'gray',
    content: [
      {
        title: 'Pengaturan Umum',
        description: 'Konfigurasi settingan aplikasi.',
        steps: [
          'Buka menu "Pengaturan" → "Profil Studio" untuk update info studio',
          'Atur "Slot Booking" untuk menentukan jam operasional',
          'Konfigurasi "Metode Pembayaran" dengan rekening yang digunakan',
          'Update "Media Sosial" di menu "Kontak"',
        ],
        tips: [
          'Pastikan data profil studio selalu up-to-date',
          'Atur slot booking sesuai ketersediaan tim',
        ],
      },
    ],
  },
  {
    id: 'website',
    title: 'Website',
    icon: <Globe className="w-5 h-5" />,
    color: 'cyan',
    content: [
      {
        title: 'Mengelola Website',
        description: 'Konfigurasi tampilan dan konten website.',
        steps: [
          'Buka menu "Website" untuk mengelola konten',
          'Atur Hero Banner di "Hero Banner"',
          'Update konten "Tentang Kami"',
          'Kelola "Section Landing" untuk mengatur section di homepage',
          'Update "SEO & Footer" untuk optimasi search engine',
        ],
        tips: [
          'Gunakan foto berkualitas tinggi untuk banner',
          'Update konten secara berkala agar website tetap fresh',
        ],
      },
    ],
  },
];

const colorMap: Record<string, { bg: string; text: string; border: string; light: string }> = {
  blue: { bg: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
  green: { bg: 'bg-green-500', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50' },
  yellow: { bg: 'bg-yellow-500', text: 'text-yellow-600', border: 'border-yellow-200', light: 'bg-yellow-50' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-600', border: 'border-pink-200', light: 'bg-pink-50' },
  indigo: { bg: 'bg-indigo-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
  teal: { bg: 'bg-teal-500', text: 'text-teal-600', border: 'border-teal-200', light: 'bg-teal-50' },
  amber: { bg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', light: 'bg-amber-50' },
  red: { bg: 'bg-red-500', text: 'text-red-600', border: 'border-red-200', light: 'bg-red-50' },
  gray: { bg: 'bg-gray-500', text: 'text-gray-600', border: 'border-gray-200', light: 'bg-gray-50' },
  cyan: { bg: 'bg-cyan-500', text: 'text-cyan-600', border: 'border-cyan-200', light: 'bg-cyan-50' },
};

export default function AdminGuide() {
  const [search, setSearch] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('dashboard');

  const filteredSections = guideSections.filter(
    (section) =>
      section.title.toLowerCase().includes(search.toLowerCase()) ||
      section.content.some(
        (c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      )
  );

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Panduan Penggunaan</h1>
            <p className="text-gray-500 dark:text-dark-text-secondary text-sm">Pelajari cara menggunakan admin panel</p>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="mb-6">
        <div className="flex items-start gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-1">Tips Cepat</h3>
            <ul className="text-sm text-gray-600 dark:text-dark-text-secondary space-y-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                Selalu periksa dashboard setiap hari untuk monitoring
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                Gunakan filter untuk mempercepat pencarian data
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                Update status booking secara berkala
              </li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Search */}
      <div className="mb-6">
        <Input
          placeholder="Cari panduan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Guide Sections */}
      <div className="space-y-4">
        {filteredSections.map((section) => {
          const colors = colorMap[section.color] || colorMap.gray;
          const isExpanded = expandedSection === section.id;

          return (
            <Card key={section.id} className="overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 text-left transition-colors',
                  isExpanded ? colors.light : 'hover:bg-gray-50 dark:hover:bg-dark-hover'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                    isExpanded ? colors.bg : 'bg-gray-100 dark:bg-dark-hover'
                  )}
                >
                  <div className={isExpanded ? 'text-white' : colors.text}>{section.icon}</div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-dark-text">{section.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                    {section.content.length} panduan tersedia
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 text-gray-400 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-4 pb-4 space-y-4">
                      {section.content.map((content, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            'p-4 rounded-xl border',
                            colors.border,
                            colors.light
                          )}
                        >
                          <h4 className="font-medium text-gray-900 dark:text-dark-text mb-2 flex items-center gap-2">
                            <MousePointerClick className={cn('w-4 h-4', colors.text)} />
                            {content.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-3">
                            {content.description}
                          </p>

                          {content.steps && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-dark-text mb-2 flex items-center gap-1">
                                <FileText className="w-3.5 h-3.5" />
                                Langkah-langkah:
                              </h5>
                              <ol className="space-y-1.5">
                                {content.steps.map((step, stepIdx) => (
                                  <li
                                    key={stepIdx}
                                    className="flex items-start gap-2 text-sm text-gray-600 dark:text-dark-text-secondary"
                                  >
                                    <span
                                      className={cn(
                                        'w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium shrink-0 mt-0.5',
                                        colors.bg,
                                        'text-white'
                                      )}
                                    >
                                      {stepIdx + 1}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          )}

                          {content.tips && (
                            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-3">
                              <h5 className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 flex items-center gap-1">
                                <Lightbulb className="w-3.5 h-3.5" />
                                Tips:
                              </h5>
                              <ul className="space-y-1">
                                {content.tips.map((tip, tipIdx) => (
                                  <li
                                    key={tipIdx}
                                    className="flex items-start gap-2 text-sm text-green-600 dark:text-green-400"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {content.warnings && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                              <h5 className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                Peringatan:
                              </h5>
                              <ul className="space-y-1">
                                {content.warnings.map((warning, warnIdx) => (
                                  <li
                                    key={warnIdx}
                                    className="flex items-start gap-2 text-sm text-amber-600 dark:text-amber-400"
                                  >
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    {warning}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>

      {/* Contact Support */}
      <Card className="mt-6">
        <div className="flex items-start gap-3 p-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Info className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-dark-text mb-1">Butuh Bantuan?</h3>
            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-2">
              Jika Anda mengalami kendala atau memiliki pertanyaan, silakan hubungi tim support.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 transition-colors"
              >
                <Phone className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email Support
              </a>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
