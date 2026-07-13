// API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  error?: string;
  errors?: ValidationError[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ValidationError {
  field: string;
  message: string;
}

// User
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin' | 'photographer' | 'videographer' | 'editor' | 'freelance';
  avatar?: string;
  createdAt?: string;
}

// Auth
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

// Category
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  _count?: {
    packages: number;
    portfolios: number;
  };
  packages?: Package[];
}

// Package
export interface Package {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  duration?: string;
  photographer?: number;
  videographer?: number;
  photoCount?: number;
  videoCount?: number;
  hasDrone: boolean;
  hasAlbum: boolean;
  hasPrint: boolean;
  hasFrame: boolean;
  hasCinematic: boolean;
  hasHighlight: boolean;
  location?: string;
  isPopular: boolean;
  isActive: boolean;
  category?: Category | { id: string; name: string; slug?: string };
  benefits?: PackageBenefit[];
  galleries?: PackageGallery[];
  _count?: {
    bookings: number;
  };
}

export interface PackageBenefit {
  id: string;
  packageId: string;
  benefit: string;
}

export interface PackageGallery {
  id: string;
  packageId: string;
  image: string;
  caption?: string;
  sortOrder: number;
}

// Booking
export type BookingStatus = 'pending' | 'waiting_payment' | 'processed' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'waiting_verification' | 'paid' | 'rejected';

export interface Booking {
  id: string;
  invoiceNumber: string;
  userId?: string;
  packageId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  eventLocation?: string;
  eventDate: string;
  eventTime: string;
  notes?: string;
  totalPrice: number;
  downPayment: number;
  remainingPayment: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  cancellationReason?: string;
  createdAt: string;
  package?: Package;
  payments?: Payment[];
}

export interface CreateBookingData {
  packageId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  eventLocation?: string;
  eventDate: string;
  eventTime: string;
  notes?: string;
}

// Payment
export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod?: string;
  proofImage?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  transferDate?: string;
  status: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  createdAt: string;
  booking?: Booking;
}

// Portfolio
export interface Portfolio {
  id: string;
  categoryId?: string;
  title: string;
  slug: string;
  description?: string;
  coverImage: string;
  isActive: boolean;
  createdAt: string;
  category?: Category;
  images?: PortfolioImage[];
  _count?: { images: number };
}

export interface PortfolioImage {
  id: string;
  portfolioId: string;
  image: string;
  caption?: string;
  sortOrder: number;
}

// Testimonial
export interface Testimonial {
  id: string;
  name: string;
  photo?: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

// FAQ
export interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

// Contact
export interface Contact {
  id: string;
  type: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok' | 'email' | 'google_maps';
  label: string;
  value: string;
  icon?: string;
  isActive: boolean;
}

// Dashboard
export interface DashboardStats {
  totalBookings: number;
  todayBookings: number;
  monthBookings: number;
  pendingBookings: number;
  paidBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthRevenue: number;
  totalCustomers: number;
  totalPackages: number;
  waitingPayments: number;
  todayEvents?: {
    id: string;
    name: string;
    eventTime: string;
    eventDate: string;
    status: string;
    package: { name: string };
  }[];
}

export interface ChartData {
  month: string;
  count: number;
  revenue: number;
}

// Settings
export interface WebsiteSettings {
  [key: string]: string | null;
}

export interface PaymentMethodConfig {
  id: string;
  label: string;
  type: 'bank_transfer' | 'ewallet' | 'cash' | 'other';
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  instructions?: string;
  isActive: boolean;
}
