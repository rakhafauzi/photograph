import {
  LayoutDashboard,
  Calendar,
  Wallet,
  Camera,
  Images,
  FolderKanban,
  Users,
  UserRound,
  Star,
  BarChart3,
  Globe,
  Settings,
  Shield,
  BookOpen,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';

export interface SubMenuItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
}

export interface SidebarMenuItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  submenu?: SubMenuItem[];
  isActive?: (pathname: string) => boolean;
}

export const sidebarMenu: SidebarMenuItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
    isActive: (pathname) => pathname === '/admin/dashboard',
  },
  {
    label: 'Booking',
    icon: Calendar,
    isActive: (pathname) => pathname.startsWith('/admin/bookings') || pathname === '/admin/calendar',
    submenu: [
      { label: 'Semua Booking', href: '/admin/bookings' },
      { label: 'Kalender Booking', href: '/admin/calendar' },
      { label: 'Booking Baru', href: '/admin/bookings?status=pending' },
      { label: 'Jadwal Hari Ini', href: '/admin/bookings?filter=today' },
      { label: 'Riwayat Booking', href: '/admin/bookings?status=completed' },
    ],
  },
  {
    label: 'Pembayaran',
    icon: Wallet,
    isActive: (pathname) => pathname.startsWith('/admin/payments'),
    submenu: [
      { label: 'Semua Pembayaran', href: '/admin/payments' },
      { label: 'Menunggu Verifikasi', href: '/admin/payments?status=waiting_verification' },
      { label: 'Sudah Lunas', href: '/admin/payments?status=verified' },
      { label: 'Ditolak', href: '/admin/payments?status=rejected' },
      { label: 'Invoice', href: '/admin/invoices' },
    ],
  },
  {
    label: 'Paket Fotografi',
    icon: Camera,
    isActive: (pathname) => pathname.startsWith('/admin/categories') || pathname.startsWith('/admin/packages'),
    submenu: [
      { label: 'Kategori Paket', href: '/admin/categories' },
      { label: 'Paket Fotografi', href: '/admin/packages' },
      { label: 'Add-on', href: '/admin/addons' },
      { label: 'Promo', href: '/admin/promos' },
    ],
  },
  {
    label: 'Portfolio',
    icon: Images,
    isActive: (pathname) => pathname.startsWith('/admin/portfolios'),
    submenu: [
      { label: 'Album', href: '/admin/portfolios' },
      { label: 'Galeri Foto', href: '/admin/gallery' },
      { label: 'Video Highlight', href: '/admin/videos' },
    ],
  },
  {
    label: 'Project',
    icon: FolderKanban,
    isActive: (pathname) => pathname.startsWith('/admin/projects'),
    submenu: [
      { label: 'Semua Project', href: '/admin/projects' },
      { label: 'Jadwal Shooting', href: '/admin/projects?status=shooting' },
      { label: 'Editing', href: '/admin/projects?status=editing' },
      { label: 'Preview Customer', href: '/admin/projects?status=preview' },
      { label: 'Printing', href: '/admin/projects?status=printing' },
      { label: 'Delivery', href: '/admin/projects?status=delivery' },
      { label: 'Completed', href: '/admin/projects?status=completed' },
    ],
  },
  {
    label: 'Customer',
    icon: Users,
    isActive: (pathname) => pathname.startsWith('/admin/customers'),
    submenu: [
      { label: 'Semua Customer', href: '/admin/customers' },
      { label: 'Riwayat Booking', href: '/admin/customers/history' },
    ],
  },
  {
    label: 'Tim',
    icon: UserRound,
    isActive: (pathname) => pathname.startsWith('/admin/team'),
    submenu: [
      { label: 'Photographer', href: '/admin/team?role=photographer' },
      { label: 'Videographer', href: '/admin/team?role=videographer' },
      { label: 'Editor', href: '/admin/team?role=editor' },
      { label: 'Admin', href: '/admin/team?role=admin' },
      { label: 'Freelance', href: '/admin/team?role=freelance' },
    ],
  },
  {
    label: 'Testimoni',
    icon: Star,
    isActive: (pathname) => pathname.startsWith('/admin/testimonials'),
    submenu: [
      { label: 'Semua Testimoni', href: '/admin/testimonials' },
      { label: 'Menunggu Persetujuan', href: '/admin/testimonials?pending=true' },
    ],
  },
  {
    label: 'Laporan',
    icon: BarChart3,
    isActive: (pathname) => pathname.startsWith('/admin/reports'),
    submenu: [
      { label: 'Pendapatan', href: '/admin/reports/revenue' },
      { label: 'Booking', href: '/admin/reports/bookings' },
      { label: 'Paket Terlaris', href: '/admin/reports/top-packages' },
      { label: 'Customer Terbanyak', href: '/admin/reports/top-customers' },
      { label: 'Photographer Terbanyak', href: '/admin/reports/top-photographers' },
      { label: 'Bulanan', href: '/admin/reports/monthly' },
      { label: 'Tahunan', href: '/admin/reports/yearly' },
    ],
  },
  {
    label: 'Website',
    icon: Globe,
    isActive: (pathname) => pathname.startsWith('/admin/website') || pathname.startsWith('/admin/faqs') || pathname.startsWith('/admin/contacts'),
    submenu: [
      { label: 'Hero Banner', href: '/admin/website/hero' },
      { label: 'Tentang Kami', href: '/admin/website/about' },
      { label: 'Section Landing', href: '/admin/website/sections' },
      { label: 'Branding Assets', href: '/admin/website/branding' },
      { label: 'SEO & Footer', href: '/admin/website/seo' },
      { label: 'Portfolio', href: '/admin/portfolios' },
      { label: 'FAQ', href: '/admin/faqs' },
      { label: 'Testimoni', href: '/admin/testimonials' },
      { label: 'Kontak', href: '/admin/contacts' },
    ],
  },
  {
    label: 'Pengaturan',
    icon: Settings,
    isActive: (pathname) => pathname.startsWith('/admin/settings'),
    submenu: [
      { label: 'Profil Studio', href: '/admin/settings' },
      { label: 'Slot Booking', href: '/admin/settings/booking-slots' },
      { label: 'Metode Pembayaran', href: '/admin/settings/payment' },
      { label: 'Media Sosial', href: '/admin/contacts' },
    ],
  },
  {
    label: 'Administrator',
    icon: Shield,
    isActive: (pathname) => pathname.startsWith('/admin/administrators'),
    submenu: [
      { label: 'Admin', href: '/admin/administrators' },
      { label: 'Role & Permission', href: '/admin/administrators/roles' },
      { label: 'Activity Log', href: '/admin/administrators/logs' },
    ],
  },
  {
    label: 'Panduan',
    icon: BookOpen,
    href: '/admin/guide',
    isActive: (pathname) => pathname === '/admin/guide',
  },
];
