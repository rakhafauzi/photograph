import { useState } from 'react';
import {
  Monitor,
  Smartphone,
  Camera,
  Star,
  Phone,
  ChevronRight,
  Instagram,
} from 'lucide-react';
import { cn, resolveAssetUrl } from '@/lib/utils';

/* ─── types ─────────────────────────────────────────── */
type DeviceMode = 'desktop' | 'mobile';
type SectionKey = 'about' | 'portfolio' | 'packages' | 'testimonials' | 'faq' | 'contact';

interface PreviewData {
  /* branding */
  studioName: string;
  logoUrl: string;
  /** theme-color hex */
  themeColor: string;
  /* hero */
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryCtaLabel: string;
  heroSecondaryCtaLabel: string;
  /* about */
  aboutBadge: string;
  aboutTitle: string;
  aboutDescription: string;
  aboutFeatures: { title: string; desc: string }[];
  /* content counts (for hero stats) */
  testimonialsCount: number;
  packagesCount: number;
  categoriesCount: number;
  /* visibility */
  showPortfolio: boolean;
  showPackages: boolean;
  showTestimonials: boolean;
  showFaq: boolean;
  showContact: boolean;
  /* order */
  sectionOrder: SectionKey[];
  /* hero toggle */
  heroSectionEnabled: boolean;
}

/* ─── Section label map ──────────────────────────────── */
const sectionLabels: Record<SectionKey, string> = {
  about: 'Tentang',
  portfolio: 'Portfolio',
  packages: 'Paket',
  testimonials: 'Testimoni',
  faq: 'FAQ',
  contact: 'Kontak',
};

/* ─── Defaults ───────────────────────────────────────── */
const defaultPreviewData: PreviewData = {
  studioName: 'Fotografi Studio',
  logoUrl: '',
  themeColor: '#0f172a',
  heroBadge: 'Premium Photography Studio',
  heroTitle: 'Abadikan Momen Berharga Bersama Kami',
  heroDescription:
    'Fotografi profesional untuk setiap momen spesial Anda. Dari wedding hingga corporate event, kami hadir dengan hasil terbaik.',
  heroPrimaryCtaLabel: 'Lihat Paket',
  heroSecondaryCtaLabel: 'Konsultasi Gratis',
  aboutBadge: 'Tentang Kami',
  aboutTitle: 'Mengabadikan Momen Terbaik Anda',
  aboutDescription:
    'Kami adalah tim fotografer profesional dengan pengalaman lebih dari 12 tahun.',
  aboutFeatures: [
    { title: 'Fotografer Profesional', desc: 'Tim fotografer berpengalaman dan bersertifikat.' },
    { title: 'Hasil Berkualitas', desc: 'Menggunakan peralatan terbaik dan teknik editing modern.' },
    { title: 'Tepat Waktu', desc: 'Komitmen terhadap deadline tanpa kompromi.' },
  ],
  testimonialsCount: 24,
  packagesCount: 12,
  categoriesCount: 6,
  showPortfolio: true,
  showPackages: true,
  showTestimonials: true,
  showFaq: true,
  showContact: true,
  sectionOrder: ['about', 'portfolio', 'packages', 'testimonials', 'faq', 'contact'],
  heroSectionEnabled: true,
};

/* ─── Props ──────────────────────────────────────────── */
interface VisualWebsitePreviewProps {
  data?: Partial<PreviewData>;
  className?: string;
}

/* ─── Scroll-shadow helper ───────────────────────────── */
function ScrollShadow({ children, className }: { children: React.ReactNode; className?: string }) {
  const [scrolled, setScrolled] = useState(false);
  return (
    <div
      className={cn('relative overflow-y-auto', className)}
      onScroll={(e) => setScrolled((e.currentTarget.scrollTop ?? 0) > 4)}
    >
      {/* top shadow */}
      <div
        className={cn(
          'pointer-events-none sticky top-0 z-10 h-3 -mb-3 transition-opacity duration-200',
          scrolled ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          background:
            'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      {children}
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function VisualWebsitePreview({
  data = {},
  className,
}: VisualWebsitePreviewProps) {
  const merged: PreviewData = { ...defaultPreviewData, ...data };
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [activeSection, setActiveSection] = useState('home');

  const {
    studioName,
    logoUrl,
    heroBadge,
    heroTitle,
    heroDescription,
    heroPrimaryCtaLabel,
    heroSecondaryCtaLabel,
    aboutBadge,
    aboutTitle,
    aboutDescription,
    aboutFeatures,
    testimonialsCount,
    packagesCount,
    categoriesCount,
    showPortfolio,
    showPackages,
    showTestimonials,
    showFaq,
    showContact,
    sectionOrder,
    heroSectionEnabled,
  } = merged;

  /* ----- device frame class ----- */
  const frameClass =
    device === 'desktop'
      ? 'aspect-[16/10] max-h-[600px] w-full rounded-xl border-2 border-gray-300 shadow-2xl'
      : 'aspect-[9/19] max-h-[600px] w-[280px] rounded-[2.5rem] border-[3px] border-gray-400 shadow-2xl';

  const innerClass = device === 'desktop' ? '' : 'rounded-[2.3rem] overflow-hidden';

  /* ----- visible sections in order ----- */
  const visibilityMap: Record<SectionKey, boolean> = {
    about: true,
    portfolio: showPortfolio,
    packages: showPackages,
    testimonials: showTestimonials && testimonialsCount > 0,
    faq: showFaq,
    contact: showContact,
  };
  const visibleSections = sectionOrder.filter((key) => visibilityMap[key]);

  /* ----- nav links ----- */
  const navLinks = [
    { label: 'Beranda', id: 'hero' },
    ...visibleSections.map((key) => ({ label: sectionLabels[key], id: key })),
  ];

  /* ----- render a hero stat pill ----- */
  const HeroStat = ({ value, label }: { value: string | number; label: string }) => (
    <div>
      <p className="text-lg font-bold text-amber-600">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );

  /* ----- about feature card (mobile condensed) ----- */
  const AboutFeatureCard = ({
    title,
    desc,
    compact,
  }: {
    title: string;
    desc: string;
    compact?: boolean;
  }) => (
    <div
      className={cn(
        'rounded-xl border border-gray-100 bg-gray-50/70 text-center',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <p className={cn('font-semibold text-gray-900', compact ? 'text-xs' : 'text-sm')}>
        {title}
      </p>
      <p className={cn('mt-1 text-gray-500', compact ? 'text-[10px]' : 'text-xs')}>{desc}</p>
    </div>
  );

  return (
    <div className={cn('space-y-4', className)}>
      {/* ─── Toolbar ─── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all',
              device === 'desktop'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all',
              device === 'mobile'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>

        {/* status badges */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live Preview
          </span>
          {visibleSections.length > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-medium text-blue-700">
              {visibleSections.length} section aktif
            </span>
          )}
        </div>
      </div>

      {/* ─── Device Frame ─── */}
      <div className="flex justify-center">
        <div className={cn('relative bg-gray-100', frameClass, innerClass)}>
          {/* phone notch */}
          {device === 'mobile' && (
            <div className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2">
              <div className="h-6 w-36 rounded-b-2xl bg-gray-900" />
              <div className="mx-auto -mt-[10px] h-2 w-16 rounded-full bg-gray-700" />
            </div>
          )}

          {/* scrollable inner content */}
          <ScrollShadow className="h-full">
            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-10 border-b border-gray-100/80 bg-white/90 backdrop-blur-md">
              <div
                className={cn(
                  'flex items-center justify-between',
                  device === 'mobile' ? 'px-3 py-2' : 'px-6 py-3'
                )}
              >
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img
                      src={resolveAssetUrl(logoUrl)}
                      alt={studioName}
                      className={cn(
                        'rounded-lg object-cover',
                        device === 'mobile' ? 'h-6 w-6' : 'h-8 w-8'
                      )}
                    />
                  ) : (
                    <Camera
                      className={cn(
                        'text-amber-600',
                        device === 'mobile' ? 'h-4 w-4' : 'h-6 w-6'
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      'font-bold text-gray-900',
                      device === 'mobile' ? 'text-xs' : 'text-base'
                    )}
                  >
                    {studioName}
                  </span>
                </div>

                {device === 'desktop' && (
                  <div className="flex items-center gap-6">
                    {navLinks.map((link) => (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => setActiveSection(link.id)}
                        className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {link.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-amber-700 transition-colors"
                    >
                      <Phone className="mr-1 inline-block h-3 w-3" />
                      Hubungi Kami
                    </button>
                  </div>
                )}

                {device === 'mobile' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="h-7 w-7 rounded-lg bg-gray-100 flex items-center justify-center"
                    >
                      <span className="block h-0.5 w-3.5 rounded-full bg-gray-600" />
                      <span className="block mt-0.5 h-0.5 w-3.5 rounded-full bg-gray-600" />
                      <span className="block mt-0.5 h-0.5 w-3.5 rounded-full bg-gray-600" />
                    </button>
                  </div>
                )}
              </div>
            </nav>

            {/* ── Hero Section ── */}
            {heroSectionEnabled && (
              <section
                className={cn(
                  'relative overflow-hidden bg-gradient-to-br from-amber-50/80 to-white',
                  device === 'mobile' ? 'px-3 py-8' : 'px-6 py-16'
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      'inline-flex rounded-full px-3 py-0.5 text-xs font-semibold',
                      'bg-amber-100 text-amber-800'
                    )}
                  >
                    {heroBadge}
                  </div>
                  <h1
                    className={cn(
                      'mt-3 font-bold text-gray-900 leading-tight',
                      device === 'mobile' ? 'text-xl' : 'text-3xl max-w-xl'
                    )}
                  >
                    {heroTitle}
                  </h1>
                  <p
                    className={cn(
                      'mt-2 text-gray-600 leading-relaxed',
                      device === 'mobile' ? 'text-xs' : 'text-sm max-w-lg'
                    )}
                  >
                    {heroDescription}
                  </p>

                  <div
                    className={cn(
                      'mt-4 flex flex-wrap gap-2',
                      device === 'mobile' ? 'flex-col' : ''
                    )}
                  >
                    <button
                      type="button"
                      className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
                    >
                      {heroPrimaryCtaLabel}
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center rounded-lg border-2 border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Phone className="mr-1.5 h-3 w-3" />
                      {heroSecondaryCtaLabel}
                    </button>
                  </div>

                  {/* Hero stats */}
                  <div
                    className={cn(
                      'mt-6 grid grid-cols-3 gap-4',
                      device === 'mobile' ? 'gap-2' : 'max-w-sm'
                    )}
                  >
                    <HeroStat value={`${testimonialsCount || 0}+`} label="Testimoni" />
                    <HeroStat value={`${packagesCount || 0}+`} label="Paket Foto" />
                    <HeroStat value={`${categoriesCount || 0}+`} label="Kategori" />
                  </div>
                </div>

                {/* subtle bg decoration */}
                <div className="pointer-events-none absolute -right-10 top-0 h-40 w-40 rounded-full bg-amber-200/20 blur-3xl" />
              </section>
            )}

            {/* ── Content Sections ── */}
            {visibleSections.map((sectionKey) => {
              switch (sectionKey) {
                case 'about':
                  return (
                    <section
                      key="about"
                      className={cn(
                        'border-t border-gray-100',
                        device === 'mobile' ? 'px-3 py-8' : 'px-6 py-12'
                      )}
                    >
                      <div className="text-center">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                          {aboutBadge}
                        </span>
                        <h2
                          className={cn(
                            'mt-3 font-bold text-gray-900',
                            device === 'mobile' ? 'text-lg' : 'text-2xl'
                          )}
                        >
                          {aboutTitle}
                        </h2>
                        <p
                          className={cn(
                            'mx-auto mt-2 text-gray-600 leading-relaxed',
                            device === 'mobile' ? 'text-xs' : 'text-sm max-w-xl'
                          )}
                        >
                          {aboutDescription}
                        </p>
                      </div>

                      <div
                        className={cn(
                          'mt-6 grid gap-4',
                          device === 'mobile' ? '' : 'grid-cols-3'
                        )}
                      >
                        {aboutFeatures.map((feat) => (
                          <AboutFeatureCard
                            key={feat.title}
                            title={feat.title}
                            desc={feat.desc}
                            compact={device === 'mobile'}
                          />
                        ))}
                      </div>
                    </section>
                  );

                case 'portfolio':
                  return (
                    <section
                      key="portfolio"
                      className={cn(
                        'border-t border-gray-100 bg-gray-50/50',
                        device === 'mobile' ? 'px-3 py-8' : 'px-6 py-12'
                      )}
                    >
                      <div className="text-center">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                          Portfolio
                        </span>
                        <h2
                          className={cn(
                            'mt-3 font-bold text-gray-900',
                            device === 'mobile' ? 'text-lg' : 'text-2xl'
                          )}
                        >
                          Hasil Karya Kami
                        </h2>
                      </div>
                      <div
                        className={cn(
                          'mt-4 grid gap-2',
                          device === 'mobile'
                            ? 'grid-cols-2'
                            : 'grid-cols-4'
                        )}
                      >
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="aspect-square rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center"
                          >
                            <Camera className={cn('text-gray-400', device === 'mobile' ? 'h-5 w-5' : 'h-8 w-8')} />
                          </div>
                        ))}
                      </div>
                    </section>
                  );

                case 'packages':
                  return (
                    <section
                      key="packages"
                      className={cn(
                        'border-t border-gray-100',
                        device === 'mobile' ? 'px-3 py-8' : 'px-6 py-12'
                      )}
                    >
                      <div className="text-center">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                          Paket Foto
                        </span>
                        <h2
                          className={cn(
                            'mt-3 font-bold text-gray-900',
                            device === 'mobile' ? 'text-lg' : 'text-2xl'
                          )}
                        >
                          Pilih Paket Sesuai Kebutuhan
                        </h2>
                      </div>
                      <div
                        className={cn(
                          'mt-4 grid gap-3',
                          device === 'mobile' ? '' : 'grid-cols-3'
                        )}
                      >
                        {[1, 2, 3].slice(0, device === 'mobile' ? 1 : 3).map((i) => (
                          <div
                            key={i}
                            className="rounded-xl border border-gray-200 bg-white p-4"
                          >
                            <div className="h-24 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Camera className="h-8 w-8 text-gray-300" />
                            </div>
                            <p className="mt-2 text-xs font-medium text-amber-700">Kategori</p>
                            <p className="text-sm font-semibold text-gray-900">Paket {i}</p>
                            <p className="mt-1 text-base font-bold text-amber-600">Rp 2.500.000</p>
                            <button
                              type="button"
                              className="mt-3 w-full rounded-lg bg-amber-600 py-1.5 text-xs font-semibold text-white"
                            >
                              Booking Sekarang
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  );

                case 'testimonials':
                  return (
                    <section
                      key="testimonials"
                      className={cn(
                        'border-t border-gray-100 bg-gray-50/50',
                        device === 'mobile' ? 'px-3 py-8' : 'px-6 py-12'
                      )}
                    >
                      <div className="text-center">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                          Testimoni
                        </span>
                        <h2
                          className={cn(
                            'mt-3 font-bold text-gray-900',
                            device === 'mobile' ? 'text-lg' : 'text-2xl'
                          )}
                        >
                          Apa Kata Klien Kami
                        </h2>
                      </div>
                      <div
                        className={cn(
                          'mt-4 grid gap-3',
                          device === 'mobile' ? '' : 'grid-cols-3'
                        )}
                      >
                        {[1, 2, 3].slice(0, device === 'mobile' ? 1 : 3).map((i) => (
                          <div key={i} className="rounded-xl border border-gray-100 bg-white p-4">
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, j) => (
                                <Star
                                  key={j}
                                  className="h-3 w-3 fill-amber-400 text-amber-400"
                                />
                              ))}
                            </div>
                            <p className="mt-2 text-xs text-gray-600 leading-relaxed">
                              &ldquo;Hasil fotonya luar biasa! Sangat puas dengan pelayanan dan hasil
                              edit yang cepat.&rdquo;
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-amber-200 flex items-center justify-center text-[10px] font-semibold text-amber-800">
                                A
                              </div>
                              <p className="text-xs font-semibold text-gray-900">Andi</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );

                case 'faq':
                  return (
                    <section
                      key="faq"
                      className={cn(
                        'border-t border-gray-100',
                        device === 'mobile' ? 'px-3 py-8' : 'px-6 py-12'
                      )}
                    >
                      <div className="text-center">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                          FAQ
                        </span>
                        <h2
                          className={cn(
                            'mt-3 font-bold text-gray-900',
                            device === 'mobile' ? 'text-lg' : 'text-2xl'
                          )}
                        >
                          Pertanyaan Umum
                        </h2>
                      </div>
                      <div className={cn('mx-auto mt-4 space-y-2', device === 'mobile' ? '' : 'max-w-2xl')}>
                        {[
                          'Bagaimana cara booking?',
                          'Berapa lama proses editing?',
                          'Apakah bisa request lokasi?',
                        ].map((q) => (
                          <div
                            key={q}
                            className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                          >
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-medium text-gray-900">{q}</p>
                              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );

                case 'contact':
                  return (
                    <section
                      key="contact"
                      className={cn(
                        'border-t border-gray-100 bg-gray-900 text-white',
                        device === 'mobile' ? 'px-3 py-8' : 'px-6 py-12'
                      )}
                    >
                      <div className="text-center">
                        <span className="inline-flex rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-800">
                          Kontak
                        </span>
                        <h2
                          className={cn(
                            'mt-3 font-bold',
                            device === 'mobile' ? 'text-lg' : 'text-2xl'
                          )}
                        >
                          Hubungi Kami
                        </h2>
                      </div>
                      <div
                        className={cn(
                          'mx-auto mt-4 grid gap-3',
                          device === 'mobile' ? '' : 'max-w-2xl grid-cols-2'
                        )}
                      >
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                          <Phone className="mx-auto h-5 w-5 text-amber-400" />
                          <p className="mt-1 text-xs font-semibold text-white">WhatsApp</p>
                          <p className="text-[10px] text-gray-400">0812-3456-7890</p>
                        </div>
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                          <Instagram className="mx-auto h-5 w-5 text-amber-400" />
                          <p className="mt-1 text-xs font-semibold text-white">Instagram</p>
                          <p className="text-[10px] text-gray-400">@fotografi.studio</p>
                        </div>
                      </div>
                      <div className="mt-6 text-center">
                        <button
                          type="button"
                          className="inline-flex items-center rounded-lg bg-amber-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-700 transition-colors"
                        >
                          <Phone className="mr-1.5 h-3.5 w-3.5" />
                          Chat WhatsApp Sekarang
                        </button>
                      </div>
                    </section>
                  );

                default:
                  return null;
              }
            })}

            {/* ── Footer ── */}
            <footer
              className={cn(
                'border-t border-gray-800 bg-gray-950 text-gray-500',
                device === 'mobile' ? 'px-3 py-6' : 'px-6 py-8'
              )}
            >
              <div className="text-center text-[10px]">
                <p>&copy; 2026 {studioName}. All rights reserved.</p>
              </div>
            </footer>
          </ScrollShadow>
        </div>
      </div>
    </div>
  );
}
