import { useState, useEffect, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Camera, ChevronRight, Star, Check, Phone, MapPin, Clock, Instagram, Facebook, ArrowUp, Menu, X, Heart, Mail, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { formatPrice, resolveAssetUrl } from '@/lib/utils';
import { useFetch } from '@/hooks/useQuery';
import type { Category, Testimonial, Faq, Contact, Package, Portfolio, WebsiteSettings } from '@/types';

type LandingSectionKey = 'about' | 'portfolio' | 'packages' | 'testimonials' | 'faq' | 'contact';

const defaultSectionOrder: LandingSectionKey[] = [
  'about',
  'portfolio',
  'packages',
  'testimonials',
  'faq',
  'contact',
];

const sectionLabels: Record<LandingSectionKey, string> = {
  about: 'Tentang',
  portfolio: 'Portfolio',
  packages: 'Paket',
  testimonials: 'Testimoni',
  faq: 'FAQ',
  contact: 'Kontak',
};

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

const staggerContainer = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.1 } },
  viewport: { once: true, amount: 0.2 },
};

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);

  // Fetch data
  const { data: categoriesData } = useFetch<Category[]>(['categories'], '/categories?all=true');
  const { data: packagesData } = useFetch<Package[]>(['packages'], '/packages?all=true');
  const { data: portfoliosData } = useFetch<Portfolio[]>(['portfolios'], '/portfolios?limit=8');
  const { data: testimonialsData } = useFetch<Testimonial[]>(['testimonials'], '/testimonials/approved');
  const { data: faqsData } = useFetch<Faq[]>(['faqs'], '/faqs');
  const { data: contactsData } = useFetch<Contact[]>(['contacts'], '/contacts/active');
  const { data: settingsData } = useFetch<WebsiteSettings>(['settings'], '/settings');

  const categories = categoriesData?.data || [];
  const packages = packagesData?.data || [];
  const portfolios = portfoliosData?.data || [];
  const testimonials = testimonialsData?.data || [];
  const faqs = faqsData?.data || [];
  const contacts = contactsData?.data || [];
  const settings = settingsData?.data || {};

  const popularPackages = packages.filter((pkg) => pkg.isPopular).slice(0, 6);
  const featuredPortfolios = portfolios.slice(0, 8);
  const whatsapp = contacts.find((c) => c.type === 'whatsapp')?.value || settings.whatsapp || '6281234567890';
  const instagram = contacts.find((c) => c.type === 'instagram')?.value || settings.instagram;
  const facebook = contacts.find((c) => c.type === 'facebook')?.value || settings.facebook;
  const tiktok = contacts.find((c) => c.type === 'tiktok')?.value || settings.tiktok;
  const googleMaps = contacts.find((c) => c.type === 'google_maps')?.value;
  const studioName = settings.studio_name || 'Fotografi Studio';
  const studioAddress = settings.address || '';
  const studioEmail = settings.email || '';
  const websiteLogoUrl = resolveAssetUrl(settings.logo_url || '');
  const faviconUrl = resolveAssetUrl(settings.favicon_url || settings.logo_url || '');
  const ogImageUrl = resolveAssetUrl(settings.og_image_url || settings.logo_url || '');
  const appleTouchIconUrl = resolveAssetUrl(settings.apple_touch_icon_url || settings.favicon_url || settings.logo_url || '');
  const heroBadge = settings.hero_badge || 'Premium Photography Studio';
  const heroTitle = settings.hero_title || 'Abadikan Momen Berharga Bersama Kami';
  const heroDescription = settings.hero_description || 'Fotografi profesional untuk setiap momen spesial Anda. Dari wedding hingga corporate event, kami hadir dengan hasil terbaik.';
  const heroPrimaryCtaLabel = settings.hero_primary_cta_label || 'Lihat Paket';
  const heroSecondaryCtaLabel = settings.hero_secondary_cta_label || 'Konsultasi Gratis';
  const aboutBadge = settings.about_badge || 'Tentang Kami';
  const aboutTitle = settings.about_title || 'Mengabadikan Momen Terbaik Anda';
  const aboutDescription = settings.about_description || 'Kami adalah tim fotografer profesional dengan pengalaman lebih dari 12 tahun. Berkomitmen memberikan hasil foto berkualitas tinggi dengan sentuhan artistik yang unik.';
  const aboutFeatures = [
    {
      icon: Camera,
      title: settings.about_feature_1_title || 'Fotografer Profesional',
      desc: settings.about_feature_1_desc || 'Tim fotografer berpengalaman dan bersertifikat dengan portofolio yang luas.',
    },
    {
      icon: Heart,
      title: settings.about_feature_2_title || 'Hasil Berkualitas',
      desc: settings.about_feature_2_desc || 'Menggunakan peralatan terbaik dan teknik editing modern untuk hasil maksimal.',
    },
    {
      icon: Clock,
      title: settings.about_feature_3_title || 'Tepat Waktu',
      desc: settings.about_feature_3_desc || 'Komitmen terhadap deadline dengan hasil yang memuaskan tanpa kompromi.',
    },
  ];
  const portfolioBadge = settings.portfolio_badge || 'Portfolio';
  const portfolioTitle = settings.portfolio_title || 'Hasil Karya Kami';
  const portfolioDescription = settings.portfolio_description || 'Lihat beberapa hasil foto terbaik dari setiap sesi pemotretan.';
  const packagesBadge = settings.packages_badge || 'Paket Foto';
  const packagesTitle = settings.packages_title || 'Pilih Paket Sesuai Kebutuhan';
  const packagesDescription = settings.packages_description || 'Tersedia berbagai paket fotografi untuk setiap momen spesial Anda.';
  const packagesPrimaryCtaLabel = settings.packages_primary_cta_label || 'Booking Sekarang';
  const packagesSecondaryCtaLabel = settings.packages_secondary_cta_label || 'Lihat Semua Paket';
  const testimonialsBadge = settings.testimonials_badge || 'Testimoni';
  const testimonialsTitle = settings.testimonials_title || 'Apa Kata Klien Kami';
  const testimonialsDescription = settings.testimonials_description || 'Kepuasan klien adalah prioritas utama kami.';
  const faqBadge = settings.faq_badge || 'FAQ';
  const faqTitle = settings.faq_title || 'Pertanyaan Umum';
  const faqDescription = settings.faq_description || 'Temukan jawaban cepat untuk pertanyaan yang paling sering ditanyakan calon customer kami.';
  const contactBadge = settings.contact_badge || 'Kontak';
  const contactTitle = settings.contact_title || 'Hubungi Kami';
  const contactDescription = settings.contact_description || 'Jangan ragu untuk menghubungi kami. Kami siap membantu Anda.';
  const contactPrimaryCtaLabel = settings.contact_primary_cta_label || 'Chat WhatsApp Sekarang';
  const footerText = settings.footer_text || 'Fotografi profesional untuk setiap momen spesial Anda.';
  const footerLinksTitle = settings.footer_links_title || 'Quick Links';
  const footerSocialTitle = settings.footer_social_title || 'Ikuti Kami';
  const copyrightText = settings.copyright_text || `© ${new Date().getFullYear()} ${studioName}. All rights reserved.`;
  const metaTitle = settings.meta_title || 'Fotografi Studio - Jasa Fotografi Profesional';
  const metaDescription = settings.meta_description || 'Jasa fotografi profesional untuk wedding, prewedding, wisuda, dan berbagai momen spesial Anda.';
  const themeColor = settings.theme_color || '#0f172a';
  const showPortfolioSection = settings.section_show_portfolio !== 'false';
  const showPackagesSection = settings.section_show_packages !== 'false';
  const showTestimonialsSection = settings.section_show_testimonials !== 'false';
  const showFaqSection = settings.section_show_faq !== 'false';
  const showContactSection = settings.section_show_contact !== 'false';
  const orderedContentSections = (() => {
    try {
      const parsed = JSON.parse(settings.homepage_section_order || '[]');
      if (!Array.isArray(parsed)) return defaultSectionOrder;

      const normalized = parsed.filter((item): item is LandingSectionKey =>
        typeof item === 'string' && defaultSectionOrder.includes(item as LandingSectionKey)
      );

      return [
        ...normalized,
        ...defaultSectionOrder.filter((item) => !normalized.includes(item)),
      ];
    } catch {
      return defaultSectionOrder;
    }
  })();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.title = metaTitle;

    const upsertMeta = (selector: string, attribute: 'name' | 'property', value: string, content: string) => {
      let tag = document.querySelector<HTMLMetaElement>(selector);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    const upsertLink = (selector: string, rel: string, href: string) => {
      let tag = document.querySelector<HTMLLinkElement>(selector);
      if (!tag) {
        tag = document.createElement('link');
        tag.setAttribute('rel', rel);
        document.head.appendChild(tag);
      }
      tag.setAttribute('href', href);
    };

    upsertMeta('meta[name="description"]', 'name', 'description', metaDescription);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', metaTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', metaDescription);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', studioName);
    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', ogImageUrl ? 'summary_large_image' : 'summary');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', metaTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', metaDescription);
    upsertMeta('meta[name="theme-color"]', 'name', 'theme-color', themeColor);

    if (ogImageUrl) {
      upsertMeta('meta[property="og:image"]', 'property', 'og:image', ogImageUrl);
      upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', ogImageUrl);
    }

    if (faviconUrl) {
      upsertLink('link[rel="icon"]', 'icon', faviconUrl);
    }

    if (appleTouchIconUrl) {
      upsertLink('link[rel="apple-touch-icon"]', 'apple-touch-icon', appleTouchIconUrl);
    }
  }, [appleTouchIconUrl, faviconUrl, metaDescription, metaTitle, ogImageUrl, studioName, themeColor]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const sectionVisibility: Record<LandingSectionKey, boolean> = {
    about: true,
    portfolio: showPortfolioSection,
    packages: showPackagesSection,
    testimonials: showTestimonialsSection && testimonials.length > 0,
    faq: showFaqSection && faqs.length > 0,
    contact: showContactSection,
  };

  const navLinks = [
    { label: 'Beranda', id: 'hero' },
    ...orderedContentSections
      .filter((sectionKey) => sectionVisibility[sectionKey])
      .map((sectionKey) => ({
        label: sectionLabels[sectionKey],
        id: sectionKey,
      })),
  ];

  const normalizeSocialValue = (value?: string | null) => value?.replace(/^@/, '').trim() || '';

  const buildContactHref = (contact: Contact) => {
    const value = contact.value.trim();

    switch (contact.type) {
      case 'whatsapp':
        return `https://wa.me/${value.replace(/\D/g, '')}`;
      case 'instagram':
        return `https://instagram.com/${normalizeSocialValue(value)}`;
      case 'facebook':
        return value.startsWith('http') ? value : `https://facebook.com/${normalizeSocialValue(value)}`;
      case 'tiktok':
        return value.startsWith('http') ? value : `https://www.tiktok.com/@${normalizeSocialValue(value)}`;
      case 'email':
        return `mailto:${value}`;
      case 'google_maps':
        return value;
      default:
        return value;
    }
  };

  const getContactIcon = (type: Contact['type']) => {
    switch (type) {
      case 'whatsapp':
        return Phone;
      case 'instagram':
        return Instagram;
      case 'facebook':
        return Facebook;
      case 'email':
        return Mail;
      case 'google_maps':
        return MapPin;
      case 'tiktok':
      default:
        return Globe;
    }
  };

  const contentSections: Record<LandingSectionKey, ReactNode> = {
    about: (
      <section id="about" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <Badge variant="gold" className="mb-4">{aboutBadge}</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {aboutTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              {aboutDescription}
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aboutFeatures.map((item) => (
              <motion.div key={item.title} {...fadeIn}>
                <Card className="text-center p-8 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 mx-auto rounded-2xl theme-accent-bg-soft-strong flex items-center justify-center mb-4">
                    <item.icon className="w-8 h-8 theme-accent-text" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    ),
    portfolio: showPortfolioSection ? (
      <section id="portfolio" className="py-20 lg:py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <Badge variant="gold" className="mb-4">{portfolioBadge}</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {portfolioTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {portfolioDescription}
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredPortfolios.map((portfolio) => (
              <motion.div key={portfolio.id} {...fadeIn} className="relative group overflow-hidden rounded-2xl">
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200">
                  {portfolio.coverImage ? (
                    <img
                      src={portfolio.coverImage}
                      alt={portfolio.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Camera className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-semibold line-clamp-1">{portfolio.title}</p>
                    <p className="text-white/80 text-sm line-clamp-1">
                      {portfolio.category?.name || 'Portfolio Studio'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    ) : null,
    packages: showPackagesSection ? (
      <section id="packages" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <Badge variant="gold" className="mb-4">{packagesBadge}</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {packagesTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {packagesDescription}
            </p>
          </motion.div>

          <motion.div {...fadeInUp} className="mt-12 flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/booking/${cat.slug}`}>
                <Button variant="outline" size="sm" className="rounded-full">
                  {cat.name}
                </Button>
              </Link>
            ))}
          </motion.div>

          <motion.div {...staggerContainer} className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularPackages.map((pkg) => (
              <motion.div key={pkg.id} {...fadeIn}>
                <Card className="relative p-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
                  {pkg.isPopular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="gold">Popular</Badge>
                    </div>
                  )}

                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                    {pkg.galleries?.[0]?.image ? (
                      <img
                        src={pkg.galleries[0].image}
                        alt={pkg.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Camera className="w-16 h-16 text-gray-400" />
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-sm theme-accent-text font-medium mb-1">
                      {pkg.category?.name || 'Kategori'}
                    </p>
                    <h3 className="text-xl font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="mt-3 text-2xl font-bold text-gradient-gold">
                      {formatPrice(pkg.price)}
                    </p>

                    <div className="mt-4 space-y-2">
                      {pkg.duration && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>Durasi: {pkg.duration}</span>
                        </div>
                      )}
                      {pkg.photographer && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Camera className="w-4 h-4" />
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
                          <div key={b.id} className="flex items-start gap-2">
                            <Check className="w-4 h-4 theme-accent-text mt-0.5 shrink-0" />
                            <span className="text-sm text-gray-600">{b.benefit}</span>
                          </div>
                        ))}
                        {pkg.benefits.length > 3 && (
                          <p className="text-sm theme-accent-text font-medium">
                            +{pkg.benefits.length - 3} benefit lainnya
                          </p>
                        )}
                      </div>
                    )}

                    <Link to={`/booking/${pkg.slug}`} className="block mt-6">
                      <Button variant="gold" className="w-full">
                        {packagesPrimaryCtaLabel}
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {categories.length > 0 && (
            <motion.div {...fadeInUp} className="mt-12 text-center">
              <Link to="#categories" onClick={(e) => { e.preventDefault(); scrollTo('packages'); }}>
                <Button variant="outline" size="lg">
                  {packagesSecondaryCtaLabel}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </section>
    ) : null,
    testimonials: showTestimonialsSection && testimonials.length > 0 ? (
      <section id="testimonials" className="py-20 lg:py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <Badge variant="gold" className="mb-4">{testimonialsBadge}</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {testimonialsTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {testimonialsDescription}
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <motion.div key={t.id} {...fadeIn}>
                <Card className="h-full">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">"{t.comment}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full theme-accent-gradient-br flex items-center justify-center text-white font-semibold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-400">Klien</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    ) : null,
    faq: showFaqSection && faqs.length > 0 ? (
      <section id="faq" className="py-20 lg:py-32 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <Badge variant="gold" className="mb-4">{faqBadge}</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {faqTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              {faqDescription}
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="space-y-4">
            {faqs.map((faq) => (
              <motion.div key={faq.id} {...fadeIn}>
                <details className="group cursor-pointer">
                  <summary className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-4 py-3 text-gray-600 text-sm leading-relaxed">
                    {faq.answer}
                  </div>
                </details>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    ) : null,
    contact: showContactSection ? (
      <section id="contact" className="py-20 lg:py-32 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto">
            <Badge variant="gold" className="mb-4">{contactBadge}</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              {contactTitle}
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              {contactDescription}
            </p>
          </motion.div>

          <motion.div {...staggerContainer} className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contacts.map((contact) => {
              const Icon = getContactIcon(contact.type);
              const href = buildContactHref(contact);

              return (
                <motion.div key={contact.id} {...fadeIn}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="block h-full">
                    <Card className="h-full bg-white/5 border-white/10 text-center p-6 hover:bg-white/10 transition-all">
                      <div className="w-12 h-12 mx-auto rounded-full theme-accent-glow flex items-center justify-center mb-3">
                        <Icon className="w-6 h-6 theme-accent-text" />
                      </div>
                      <h3 className="font-semibold text-white">{contact.label}</h3>
                      <p className="mt-1 text-sm text-gray-400 break-words">{contact.value}</p>
                    </Card>
                  </a>
                </motion.div>
              );
            })}
          </motion.div>

          {(studioEmail || studioAddress) && (
            <div className="mt-8 flex flex-col items-center gap-2 text-sm text-gray-400">
              {studioEmail && <p>Email studio: {studioEmail}</p>}
              {studioAddress && <p>Alamat: {studioAddress}</p>}
            </div>
          )}

          <motion.div {...fadeInUp} className="mt-16 text-center">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="gold" size="xl">
                <Phone className="w-5 h-5 mr-2" />
                {contactPrimaryCtaLabel}
              </Button>
            </a>
          </motion.div>
        </div>
      </section>
    ) : null,
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ==================== STICKY NAVBAR ==================== */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {websiteLogoUrl ? (
                <img src={websiteLogoUrl} alt={studioName} className="h-9 w-9 rounded-2xl object-cover shadow-sm" />
              ) : (
                <Camera className="w-7 h-7 theme-accent-text" />
              )}
              <span className="text-lg font-bold text-gray-900">{studioName}</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="gold" size="sm">
                  <Phone className="w-4 h-4 mr-2" />
                  Hubungi Kami
                </Button>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollTo(link.id)}
                  className="block w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-2"
              >
                <Button variant="gold" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Hubungi Kami
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* ==================== HERO SECTION ==================== */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden theme-accent-bg-soft">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] theme-accent-glow-subtle via-transparent to-transparent" />
          <div className="absolute top-20 right-20 w-72 h-72 theme-accent-glow-subtle rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 theme-accent-glow rounded-full blur-3xl" />
        </motion.div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Badge variant="gold" className="mb-4">
                {heroBadge}
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                {heroTitle}
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-lg">
                {heroDescription}
              </p>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link to="#packages" onClick={(e) => { e.preventDefault(); scrollTo('packages'); }}>
                  <Button variant="gold" size="lg">
                    {heroPrimaryCtaLabel}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="lg">
                    <Phone className="w-5 h-5 mr-2" />
                    {heroSecondaryCtaLabel}
                  </Button>
                </a>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8">
                {[
                  { value: `${testimonials.length || 0}+`, label: 'Testimoni' },
                  { value: `${packages.length || 0}+`, label: 'Paket Foto' },
                  { value: `${categories.length || 0}+`, label: 'Kategori' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl lg:text-3xl font-bold text-gradient-gold">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="w-96 h-96 rounded-full theme-accent-gradient-br p-1">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <Camera className="w-32 h-32 theme-accent-text" />
                  </div>
                </div>
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-semibold">4.9 Rating</span>
                  </div>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-semibold">Hasil Terbaik</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ArrowUp className="w-5 h-5 text-gray-400 rotate-180" />
        </motion.div>
      </section>

      {orderedContentSections.map((sectionKey) => contentSections[sectionKey])}

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-gray-950 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {websiteLogoUrl ? (
                  <img src={websiteLogoUrl} alt={studioName} className="h-9 w-9 rounded-2xl object-cover" />
                ) : (
                  <Camera className="w-6 h-6 theme-accent-text" />
                )}
                <span className="text-lg font-bold text-white">{studioName}</span>
              </div>
              <p className="text-sm leading-relaxed">{footerText}</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{footerLinksTitle}</h4>
              <div className="space-y-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollTo(link.id)}
                    className="block text-sm hover:theme-accent-text transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">{footerSocialTitle}</h4>
              <div className="flex gap-3">
                {instagram && (                    <a href={`https://instagram.com/${normalizeSocialValue(instagram)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:theme-accent-glow transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
                {facebook && (
                  <a href={facebook.startsWith('http') ? facebook : `https://facebook.com/${normalizeSocialValue(facebook)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:theme-accent-glow transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                )}
                {tiktok && (
                  <a href={tiktok.startsWith('http') ? tiktok : `https://www.tiktok.com/@${normalizeSocialValue(tiktok)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:theme-accent-glow transition-colors">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:theme-accent-glow transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
                {googleMaps && (
                  <a href={googleMaps} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:theme-accent-glow transition-colors">
                    <MapPin className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-sm">
            <p>{copyrightText}</p>
          </div>
        </div>
      </footer>

      {/* ==================== SCROLL TO TOP ==================== */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-40 w-12 h-12 rounded-full theme-accent-gradient text-white shadow-lg flex items-center justify-center hover:opacity-90 transition-all"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}

      {/* ==================== FLOATING WHATSAPP ==================== */}
      <a
        href={`https://wa.me/${whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 left-8 z-40 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center hover:bg-emerald-600 transition-all hover:scale-110"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}
