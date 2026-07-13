import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Eye,
  Image,
  LayoutTemplate,
  MonitorSmartphone,
  Save,
  Search,
  Settings2,
  ExternalLink,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import FileUpload from '@/components/ui/FileUpload';
import Input from '@/components/ui/input';
import Skeleton from '@/components/ui/skeleton';
import Textarea from '@/components/ui/textarea';
import VisualWebsitePreview from '@/components/preview/VisualWebsitePreview';
import { useFetch, useMutationAction } from '@/hooks/useQuery';
import type { WebsiteSettings } from '@/types';
import { resolveAssetUrl } from '@/lib/utils';
import { toast } from 'sonner';

type WebsiteSectionKey = 'hero' | 'about' | 'sections' | 'branding' | 'seo' | 'preview';
type LandingSectionOrderKey = 'about' | 'portfolio' | 'packages' | 'testimonials' | 'faq' | 'contact';

const defaultLandingSectionOrder: LandingSectionOrderKey[] = [
  'about',
  'portfolio',
  'packages',
  'testimonials',
  'faq',
  'contact',
];

const landingSectionMeta: Record<LandingSectionOrderKey, { label: string; description: string }> = {
  about: {
    label: 'Tentang Kami',
    description: 'Cerita studio, value proposition, dan feature utama.',
  },
  portfolio: {
    label: 'Portfolio',
    description: 'Showcase hasil foto terbaik dan album pilihan.',
  },
  packages: {
    label: 'Paket',
    description: 'Daftar kategori dan paket fotografi yang bisa dibooking.',
  },
  testimonials: {
    label: 'Testimoni',
    description: 'Ulasan customer yang sudah disetujui admin.',
  },
  faq: {
    label: 'FAQ',
    description: 'Pertanyaan umum yang membantu konversi pengunjung.',
  },
  contact: {
    label: 'Kontak',
    description: 'Channel komunikasi, CTA WhatsApp, dan info studio.',
  },
};

const websiteSections: {
  key: WebsiteSectionKey;
  label: string;
  href: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: 'hero',
    label: 'Hero Banner',
    href: '/admin/website/hero',
    description: 'Kontrol copy utama, badge, dan CTA di landing page.',
    icon: LayoutTemplate,
  },
  {
    key: 'about',
    label: 'Tentang Kami',
    href: '/admin/website/about',
    description: 'Kelola section company story dan value proposition.',
    icon: BadgeCheck,
  },
  {
    key: 'sections',
    label: 'Section Landing',
    href: '/admin/website/sections',
    description: 'Atur heading, CTA, dan visibilitas section publik.',
    icon: Settings2,
  },
  {
    key: 'branding',
    label: 'Branding Assets',
    href: '/admin/website/branding',
    description: 'Kelola logo website, logo admin, favicon, dan og image.',
    icon: Image,
  },
  {
    key: 'seo',
    label: 'SEO & Footer',
    href: '/admin/website/seo',
    description: 'Kelola metadata website, footer, dan copyright.',
    icon: Search,
  },
  {
    key: 'preview',
    label: 'Preview',
    href: '/admin/website/preview',
    description: 'Lihat ringkasan konten CMS yang akan tampil ke pengunjung.',
    icon: Eye,
  },
];

const getSectionFromPath = (pathname: string): WebsiteSectionKey => {
  if (pathname.includes('/website/about')) return 'about';
  if (pathname.includes('/website/sections')) return 'sections';
  if (pathname.includes('/website/branding')) return 'branding';
  if (pathname.includes('/website/seo')) return 'seo';
  if (pathname.includes('/website/preview')) return 'preview';
  return 'hero';
};

const isEnabled = (value: string | null | undefined, fallback = true) => {
  if (value == null) return fallback;
  return value === 'true';
};

export default function AdminWebsite() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentSection = getSectionFromPath(location.pathname);

  const { data, isLoading } = useFetch<WebsiteSettings>(['settings'], '/settings');
  const settings = data?.data || {};

  const updateSetting = useMutationAction<Record<string, string>, any>(
    '/settings',
    'put',
    { successMessage: 'CMS Website berhasil disimpan', invalidateKeys: [['settings']] }
  );

  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (Object.keys(settings).length > 0 && Object.keys(formData).length === 0) {
      const normalized = Object.fromEntries(
        Object.entries(settings).map(([key, value]) => [key, value ?? ''])
      );
      setFormData(normalized);
    }
  }, [settings, formData]);

  const setField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    const changedSettings = Object.fromEntries(
      Object.entries(formData).filter(([key, value]) => value !== (settings[key] ?? ''))
    );

    if (Object.keys(changedSettings).length === 0) {
      toast.info('Belum ada perubahan untuk disimpan');
      return;
    }

    await updateSetting.mutateAsync(changedSettings);
  };

  const heroFields = [
    { key: 'hero_badge', label: 'Hero Badge', type: 'text' },
    { key: 'hero_title', label: 'Hero Title', type: 'textarea' },
    { key: 'hero_description', label: 'Hero Description', type: 'textarea' },
    { key: 'hero_primary_cta_label', label: 'Label CTA Utama', type: 'text' },
    { key: 'hero_secondary_cta_label', label: 'Label CTA Sekunder', type: 'text' },
  ] as const;

  const aboutFields = [
    { key: 'about_badge', label: 'About Badge', type: 'text' },
    { key: 'about_title', label: 'About Title', type: 'text' },
    { key: 'about_description', label: 'About Description', type: 'textarea' },
    { key: 'about_feature_1_title', label: 'Feature 1 Title', type: 'text' },
    { key: 'about_feature_1_desc', label: 'Feature 1 Description', type: 'textarea' },
    { key: 'about_feature_2_title', label: 'Feature 2 Title', type: 'text' },
    { key: 'about_feature_2_desc', label: 'Feature 2 Description', type: 'textarea' },
    { key: 'about_feature_3_title', label: 'Feature 3 Title', type: 'text' },
    { key: 'about_feature_3_desc', label: 'Feature 3 Description', type: 'textarea' },
  ] as const;

  const sectionHeadingFields = [
    { key: 'portfolio_badge', label: 'Portfolio Badge', type: 'text' },
    { key: 'portfolio_title', label: 'Portfolio Title', type: 'text' },
    { key: 'portfolio_description', label: 'Portfolio Description', type: 'textarea' },
    { key: 'packages_badge', label: 'Packages Badge', type: 'text' },
    { key: 'packages_title', label: 'Packages Title', type: 'text' },
    { key: 'packages_description', label: 'Packages Description', type: 'textarea' },
    { key: 'packages_primary_cta_label', label: 'Label Tombol Booking', type: 'text' },
    { key: 'packages_secondary_cta_label', label: 'Label Tombol Lihat Semua', type: 'text' },
    { key: 'testimonials_badge', label: 'Testimonials Badge', type: 'text' },
    { key: 'testimonials_title', label: 'Testimonials Title', type: 'text' },
    { key: 'testimonials_description', label: 'Testimonials Description', type: 'textarea' },
    { key: 'faq_badge', label: 'FAQ Badge', type: 'text' },
    { key: 'faq_title', label: 'FAQ Title', type: 'text' },
    { key: 'faq_description', label: 'FAQ Description', type: 'textarea' },
    { key: 'contact_badge', label: 'Contact Badge', type: 'text' },
    { key: 'contact_title', label: 'Contact Title', type: 'text' },
    { key: 'contact_description', label: 'Contact Description', type: 'textarea' },
    { key: 'contact_primary_cta_label', label: 'Label CTA Kontak', type: 'text' },
  ] as const;

  const seoFields = [
    { key: 'meta_title', label: 'Meta Title', type: 'text' },
    { key: 'meta_description', label: 'Meta Description', type: 'textarea' },
    { key: 'footer_text', label: 'Footer Description', type: 'textarea' },
    { key: 'footer_links_title', label: 'Footer Links Title', type: 'text' },
    { key: 'footer_social_title', label: 'Footer Social Title', type: 'text' },
    { key: 'copyright_text', label: 'Copyright Text', type: 'text' },
  ] as const;

  const visibilityFields = [
    { key: 'section_show_portfolio', label: 'Tampilkan Portfolio' },
    { key: 'section_show_packages', label: 'Tampilkan Paket' },
    { key: 'section_show_testimonials', label: 'Tampilkan Testimoni' },
    { key: 'section_show_faq', label: 'Tampilkan FAQ' },
    { key: 'section_show_contact', label: 'Tampilkan Kontak' },
  ] as const;

  const renderField = (field: { key: string; label: string; type: 'text' | 'textarea' }) => {
    if (field.type === 'textarea') {
      return (
        <Textarea
          label={field.label}
          value={formData[field.key] || ''}
          onChange={(e) => setField(field.key, e.target.value)}
          placeholder={`Masukkan ${field.label.toLowerCase()}...`}
        />
      );
    }

    return (
      <Input
        label={field.label}
        value={formData[field.key] || ''}
        onChange={(e) => setField(field.key, e.target.value)}
        placeholder={`Masukkan ${field.label.toLowerCase()}...`}
      />
    );
  };

  const previewHeroTitle = formData.hero_title || settings.hero_title || 'Abadikan Momen Berharga Bersama Kami';
  const previewAboutTitle = formData.about_title || settings.about_title || 'Mengabadikan Momen Terbaik Anda';
  const websiteLogoUrl = resolveAssetUrl(formData.logo_url || settings.logo_url || '');
  const adminLogoUrl = resolveAssetUrl(formData.admin_logo_url || settings.admin_logo_url || formData.logo_url || settings.logo_url || '');
  const faviconUrl = resolveAssetUrl(formData.favicon_url || settings.favicon_url || '');
  const ogImageUrl = resolveAssetUrl(formData.og_image_url || settings.og_image_url || formData.logo_url || settings.logo_url || '');
  const themeColor = formData.theme_color || settings.theme_color || '#0f172a';
  const landingSectionOrder = (() => {
    try {
      const parsed = JSON.parse(formData.homepage_section_order || settings.homepage_section_order || '[]');
      if (!Array.isArray(parsed)) return defaultLandingSectionOrder;

      const normalized = parsed.filter((item): item is LandingSectionOrderKey =>
        typeof item === 'string' && defaultLandingSectionOrder.includes(item as LandingSectionOrderKey)
      );

      return [
        ...normalized,
        ...defaultLandingSectionOrder.filter((item) => !normalized.includes(item)),
      ];
    } catch {
      return defaultLandingSectionOrder;
    }
  })();

  const moveSection = (sectionKey: LandingSectionOrderKey, direction: 'up' | 'down') => {
    const currentIndex = landingSectionOrder.indexOf(sectionKey);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= landingSectionOrder.length) {
      return;
    }

    const nextOrder = [...landingSectionOrder];
    [nextOrder[currentIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[currentIndex]];
    setField('homepage_section_order', JSON.stringify(nextOrder));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Card>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-16 w-full" />
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CMS Website</h1>
          <p className="mt-1 text-sm text-gray-500">
            Kelola copy landing page, section publik, SEO, dan footer dari satu tempat.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <MonitorSmartphone className="mr-2 h-4 w-4" />
              Buka Website
            </Button>
          </Link>
          <Button variant="gold" onClick={handleSave} isLoading={updateSetting.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Simpan
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          {websiteSections.map((section) => {
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
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${isActive ? 'theme-accent-gradient text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{section.label}</p>
                    <p className="mt-1 text-xs text-gray-500">{section.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {currentSection === 'hero' && (
        <>
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Hero Banner</h2>
              <p className="mt-1 text-sm text-gray-500">Bagian pertama yang dilihat pengunjung saat membuka website.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {heroFields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gray-50">
            <h3 className="font-semibold text-gray-900">Preview Hero Copy</h3>
            <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="inline-flex rounded-full theme-accent-surface px-3 py-1 text-xs font-semibold theme-accent-text">
                {formData.hero_badge || settings.hero_badge || 'Premium Photography Studio'}
              </p>
              <h4 className="mt-4 text-3xl font-bold text-gray-900">{previewHeroTitle}</h4>
              <p className="mt-3 max-w-2xl text-gray-600">
                {formData.hero_description || settings.hero_description || 'Fotografi profesional untuk setiap momen spesial Anda.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="gold">{formData.hero_primary_cta_label || settings.hero_primary_cta_label || 'Lihat Paket'}</Button>
                <Button variant="outline">{formData.hero_secondary_cta_label || settings.hero_secondary_cta_label || 'Konsultasi Gratis'}</Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {currentSection === 'about' && (
        <>
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Tentang Kami</h2>
              <p className="mt-1 text-sm text-gray-500">Kelola narasi studio dan tiga poin keunggulan utama.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {aboutFields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gray-50">
            <h3 className="font-semibold text-gray-900">Preview About</h3>
            <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="inline-flex rounded-full theme-accent-surface px-3 py-1 text-xs font-semibold theme-accent-text">
                {formData.about_badge || settings.about_badge || 'Tentang Kami'}
              </p>
              <h4 className="mt-4 text-2xl font-bold text-gray-900">{previewAboutTitle}</h4>
              <p className="mt-3 text-gray-600">
                {formData.about_description || settings.about_description || 'Kami adalah tim fotografer profesional dengan pengalaman bertahun-tahun.'}
              </p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                    <p className="font-semibold text-gray-900">
                      {formData[`about_feature_${index}_title`] || settings[`about_feature_${index}_title`] || `Feature ${index}`}
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      {formData[`about_feature_${index}_desc`] || settings[`about_feature_${index}_desc`] || 'Deskripsi feature belum diisi.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </>
      )}

      {currentSection === 'sections' && (
        <>
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Visibilitas Section</h2>
              <p className="mt-1 text-sm text-gray-500">Tentukan section mana saja yang tampil di landing page.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibilityFields.map((field) => {
                const active = isEnabled(formData[field.key] || settings[field.key], true);

                return (
                  <button
                    key={field.key}
                    type="button"
                    onClick={() => setField(field.key, active ? 'false' : 'true')}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      active
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <p className="font-semibold text-gray-900">{field.label}</p>
                    <p className={`mt-1 text-sm ${active ? 'text-emerald-700' : 'text-gray-500'}`}>
                      {active ? 'Section aktif dan akan tampil di website.' : 'Section disembunyikan dari landing page.'}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Urutan Section Landing</h2>
              <p className="mt-1 text-sm text-gray-500">`Hero` tetap tampil paling atas. Susunan di bawah ini mengatur urutan section konten setelah hero pada halaman public.</p>
            </div>

            <div className="space-y-3">
              {landingSectionOrder.map((sectionKey, index) => {
                const meta = landingSectionMeta[sectionKey];
                const relatedVisibilityKey = sectionKey === 'about' ? null : `section_show_${sectionKey}`;
                const isVisible = relatedVisibilityKey
                  ? isEnabled(formData[relatedVisibilityKey] || settings[relatedVisibilityKey], true)
                  : true;

                return (
                  <div
                    key={sectionKey}
                    className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100 text-sm font-semibold text-gray-600">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{meta.label}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isVisible ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {isVisible ? 'Tampil' : 'Disembunyikan'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{meta.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveSection(sectionKey, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => moveSection(sectionKey, 'down')}
                        disabled={index === landingSectionOrder.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Heading & CTA Section</h2>
              <p className="mt-1 text-sm text-gray-500">Kelola badge, judul, deskripsi, dan label tombol tiap section landing.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {sectionHeadingFields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Kelola Collection Content</h2>
              <p className="mt-1 text-sm text-gray-500">Untuk isi section dinamis, gunakan modul admin yang sudah ada di bawah ini.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Portfolio', href: '/admin/portfolios', description: 'Kelola album dan cover image portfolio.' },
                { label: 'FAQ', href: '/admin/faqs', description: 'Kelola daftar pertanyaan yang tampil di landing.' },
                { label: 'Testimoni', href: '/admin/testimonials', description: 'Setujui testimoni customer untuk tampil di website.' },
                { label: 'Kontak', href: '/admin/contacts', description: 'Kelola channel kontak yang tampil di landing dan footer.' },
              ].map((item) => (
                <Link key={item.href} to={item.href}>
                  <Card className="h-full p-5 hover:shadow-md transition-shadow">
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </Card>
        </>
      )}

      {currentSection === 'branding' && (
        <>
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Branding Assets</h2>
              <p className="mt-1 text-sm text-gray-500">Upload aset visual utama agar website public dan admin panel memakai identitas brand yang konsisten.</p>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">Logo Website</h3>
                  <p className="mt-1 text-sm text-gray-500">Tampil di navbar dan footer landing page public.</p>
                </div>
                <FileUpload
                  folder="logo"
                  currentImage={websiteLogoUrl}
                  onUpload={(url) => setField('logo_url', url)}
                  className="max-w-xl"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">Logo Admin Panel</h3>
                  <p className="mt-1 text-sm text-gray-500">Dipakai di sidebar admin. Kosongkan jika ingin mengikuti logo website.</p>
                </div>
                <FileUpload
                  folder="logo"
                  currentImage={adminLogoUrl}
                  onUpload={(url) => setField('admin_logo_url', url)}
                  className="max-w-xl"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">Favicon</h3>
                  <p className="mt-1 text-sm text-gray-500">Ikon kecil yang tampil di tab browser dan bookmark.</p>
                </div>
                <FileUpload
                  folder="logo"
                  currentImage={faviconUrl}
                  onUpload={(url) => setField('favicon_url', url)}
                  className="max-w-xl"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <h3 className="font-medium text-gray-900">OG Image</h3>
                  <p className="mt-1 text-sm text-gray-500">Gambar preview saat halaman dibagikan ke WhatsApp, Facebook, dan media sosial lain.</p>
                </div>
                <FileUpload
                  folder="logo"
                  currentImage={ogImageUrl}
                  onUpload={(url) => setField('og_image_url', url)}
                  className="max-w-xl"
                />
              </div>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <Input
                label="Theme Color"
                value={themeColor}
                onChange={(e) => setField('theme_color', e.target.value)}
                placeholder="#0f172a"
              />
              <Input
                label="Apple Touch Icon URL"
                value={formData.apple_touch_icon_url || settings.apple_touch_icon_url || ''}
                onChange={(e) => setField('apple_touch_icon_url', e.target.value)}
                placeholder="Kosongkan untuk mengikuti favicon"
              />
            </div>
          </Card>

          <Card className="bg-gray-50">
            <h3 className="font-semibold text-gray-900">Preview Branding</h3>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-gray-200 bg-white p-5">
                <p className="text-sm font-medium text-gray-500">Navbar Public</p>
                <div className="mt-4 flex items-center gap-3">
                  {websiteLogoUrl ? (
                    <img src={websiteLogoUrl} alt="Logo Website" className="h-12 w-12 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                      <Image className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{formData.studio_name || settings.studio_name || 'Fotografi Studio'}</p>
                    <p className="text-xs text-gray-500">Website Logo</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5">
                <p className="text-sm font-medium text-gray-500">Sidebar Admin</p>
                <div className="mt-4 flex items-center gap-3">
                  {adminLogoUrl ? (
                    <img src={adminLogoUrl} alt="Logo Admin" className="h-12 w-12 rounded-2xl object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl theme-accent-gradient text-white">
                      <Image className="h-5 w-5" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">Admin Panel</p>
                    <p className="text-xs text-gray-500">{formData.studio_name || settings.studio_name || 'Fotografi Studio'}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-gray-200 bg-white p-5">
                <p className="text-sm font-medium text-gray-500">Favicon & Theme</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="rounded-2xl border border-gray-200 p-2">
                    {faviconUrl ? (
                      <img src={faviconUrl} alt="Favicon" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        <Image className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: themeColor }} />
                      <span className="text-sm font-medium text-gray-900">{themeColor}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Dipakai untuk `theme-color` browser.</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {currentSection === 'seo' && (
        <>
          <Card>
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900">SEO & Footer</h2>
              <p className="mt-1 text-sm text-gray-500">Metadata ini membantu branding website dan snippet hasil pencarian.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {seoFields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-gray-50">
            <h3 className="font-semibold text-gray-900">Preview Snippet SEO</h3>
            <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-emerald-700">https://fotografi-studio.com</p>
              <h4 className="mt-2 text-xl font-semibold text-blue-700">
                {formData.meta_title || settings.meta_title || 'Fotografi Studio - Jasa Fotografi Profesional'}
              </h4>
              <p className="mt-2 text-sm text-gray-600">
                {formData.meta_description || settings.meta_description || 'Jasa fotografi profesional untuk wedding, wisuda, dan berbagai momen spesial Anda.'}
              </p>
            </div>
          </Card>
        </>
      )}

      {currentSection === 'preview' && (
        <>
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Live Preview Website</h2>
                <p className="mt-1 text-sm text-gray-500">Pratinjau visual landing page secara langsung berdasarkan konten CMS yang sudah diisi. Data akan otomatis menyesuaikan dengan perubahan yang Anda buat di tab lain.</p>
              </div>
              <Link to="/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-1.5 h-4 w-4" />
                  Buka Website
                </Button>
              </Link>
            </div>

            <VisualWebsitePreview
              data={{
                studioName: formData.studio_name || settings.studio_name || 'Fotografi Studio',
                logoUrl: formData.logo_url || settings.logo_url || '',
                heroBadge: formData.hero_badge || settings.hero_badge || 'Premium Photography Studio',
                heroTitle: previewHeroTitle,
                heroDescription: formData.hero_description || settings.hero_description || 'Fotografi profesional untuk setiap momen spesial Anda.',
                heroPrimaryCtaLabel: formData.hero_primary_cta_label || settings.hero_primary_cta_label || 'Lihat Paket',
                heroSecondaryCtaLabel: formData.hero_secondary_cta_label || settings.hero_secondary_cta_label || 'Konsultasi Gratis',
                aboutBadge: formData.about_badge || settings.about_badge || 'Tentang Kami',
                aboutTitle: previewAboutTitle,
                aboutDescription: formData.about_description || settings.about_description || 'Kami adalah tim fotografer profesional.',
                aboutFeatures: [
                  {
                    title: formData.about_feature_1_title || settings.about_feature_1_title || 'Fotografer Profesional',
                    desc: formData.about_feature_1_desc || settings.about_feature_1_desc || 'Tim fotografer berpengalaman.',
                  },
                  {
                    title: formData.about_feature_2_title || settings.about_feature_2_title || 'Hasil Berkualitas',
                    desc: formData.about_feature_2_desc || settings.about_feature_2_desc || 'Peralatan terbaik dan teknik editing modern.',
                  },
                  {
                    title: formData.about_feature_3_title || settings.about_feature_3_title || 'Tepat Waktu',
                    desc: formData.about_feature_3_desc || settings.about_feature_3_desc || 'Komitmen terhadap deadline tanpa kompromi.',
                  },
                ],
                testimonialsCount: parseInt(formData.testimonials_count || settings.testimonials_count || '24'),
                packagesCount: parseInt(formData.packages_count || settings.packages_count || '12'),
                categoriesCount: parseInt(formData.categories_count || settings.categories_count || '6'),
                showPortfolio: isEnabled(formData.section_show_portfolio || settings.section_show_portfolio, true),
                showPackages: isEnabled(formData.section_show_packages || settings.section_show_packages, true),
                showTestimonials: isEnabled(formData.section_show_testimonials || settings.section_show_testimonials, true),
                showFaq: isEnabled(formData.section_show_faq || settings.section_show_faq, true),
                showContact: isEnabled(formData.section_show_contact || settings.section_show_contact, true),
                sectionOrder: landingSectionOrder,
              }}
            />
          </Card>

          {/* Section Ringkasan */}
          <Card>
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900">Ringkasan Konten</h3>
              <p className="mt-1 text-sm text-gray-500">Status visibilitas dan urutan section di landing page.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {visibilityFields.map((field) => {
                const active = isEnabled(formData[field.key] || settings[field.key], true);

                return (
                  <div
                    key={field.key}
                    className={`rounded-2xl border p-4 transition-all ${
                      active
                        ? 'border-emerald-200 bg-emerald-50/70 shadow-sm'
                        : 'border-gray-200 bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">
                        {field.label.replace('Tampilkan ', '')}
                      </p>
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                          active
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-300 text-white'
                        }`}
                      >
                        {active ? '✓' : '—'}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-xs ${
                        active ? 'text-emerald-700' : 'text-gray-500'
                      }`}
                    >
                      {active ? 'Aktif' : 'Disembunyikan'}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Urutan Section Landing
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {landingSectionOrder.map((sectionKey, index) => (
                  <div
                    key={sectionKey}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-800">
                      {index + 1}
                    </span>
                    <span className="text-xs font-medium text-gray-700">
                      {landingSectionMeta[sectionKey].label}
                    </span>
                    {!isEnabled(
                      formData[`section_show_${sectionKey === 'about' ? '' : sectionKey}`] ||
                        settings[`section_show_${sectionKey === 'about' ? '' : sectionKey}`],
                      true
                    ) && sectionKey !== 'about' && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                        Nonaktif
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900">Tautan Cepat</h3>
              <p className="mt-1 text-sm text-gray-500">Buka modul yang berhubungan langsung dengan konten public.</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Landing Page Public', href: '/', external: true, icon: MonitorSmartphone },
                { label: 'Portfolio Admin', href: '/admin/portfolios', icon: Image },
                { label: 'Testimoni Admin', href: '/admin/testimonials', icon: BadgeCheck },
                { label: 'Kontak Admin', href: '/admin/contacts', icon: Eye },
              ].map((linkItem) => {
                const LinkIcon = linkItem.icon;
                const content = (
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                      <LinkIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{linkItem.label}</p>
                      <p className="text-xs text-gray-500">
                        {linkItem.external ? 'Buka di tab baru →' : 'Buka halaman'}
                      </p>
                    </div>
                  </div>
                );

                return linkItem.external ? (
                  <Link key={linkItem.href} to={linkItem.href} target="_blank" rel="noopener noreferrer">
                    <Card className="p-4 hover:shadow-md hover:border-amber-200 transition-all cursor-pointer">
                      {content}
                    </Card>
                  </Link>
                ) : (
                  <Link key={linkItem.href} to={linkItem.href}>
                    <Card className="p-4 hover:shadow-md hover:border-amber-200 transition-all">
                      {content}
                    </Card>
                  </Link>
                );
              })}
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
}
