import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LandingPage from '@/pages/LandingPage';
import BookingPage from '@/pages/BookingPage';
import BookingCheckout from '@/pages/BookingCheckout';
import TrackBooking from '@/pages/TrackBooking';
import PaymentUpload from '@/pages/PaymentUpload';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminLayout from '@/layouts/AdminLayout';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminPackages from '@/pages/admin/AdminPackages';
import AdminBookings from '@/pages/admin/AdminBookings';
import AdminBookingDetail from '@/pages/admin/AdminBookingDetail';
import AdminPortfolios from '@/pages/admin/AdminPortfolios';
import AdminTestimonials from '@/pages/admin/AdminTestimonials';
import AdminFaqs from '@/pages/admin/AdminFaqs';
import AdminContacts from '@/pages/admin/AdminContacts';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminCalendar from '@/pages/admin/AdminCalendar';
import AdminPayments from '@/pages/admin/payments/AdminPayments';
import AdminProjects from '@/pages/admin/projects/AdminProjects';
import AdminCustomers from '@/pages/admin/customers/AdminCustomers';
import AdminTeam from '@/pages/admin/team/AdminTeam';
import AdminReports from '@/pages/admin/reports/AdminReports';
import AdminWebsite from '@/pages/admin/website/AdminWebsite';
import AdminAdministrators from '@/pages/admin/administrators/AdminAdministrators';
import AdminInvoices from '@/pages/admin/invoices/AdminInvoices';
import AdminAddons from '@/pages/admin/addons/AdminAddons';
import AdminPromos from '@/pages/admin/promos/AdminPromos';
import AdminGallery from '@/pages/admin/gallery/AdminGallery';
import AdminVideos from '@/pages/admin/videos/AdminVideos';
import AdminGuide from '@/pages/admin/AdminGuide';
import LoadingScreen from '@/components/LoadingScreen';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAdmin) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/booking/:packageSlug" element={<BookingPage />} />
      <Route path="/checkout" element={<BookingCheckout />} />
      <Route path="/track-booking" element={<TrackBooking />} />
      <Route path="/payment" element={<PaymentUpload />} />

      {/* Admin Login */}
      <Route
        path="/admin/login"
        element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="bookings" element={<AdminBookings />} />
        <Route path="bookings/:id" element={<AdminBookingDetail />} />
        <Route path="portfolios" element={<AdminPortfolios />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="faqs" element={<AdminFaqs />} />
        <Route path="contacts" element={<AdminContacts />} />
        <Route path="settings/*" element={<AdminSettings />} />
        <Route path="calendar" element={<AdminCalendar />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="team" element={<AdminTeam />} />
        <Route path="reports/*" element={<AdminReports />} />
        <Route path="website/*" element={<AdminWebsite />} />
        <Route path="invoices" element={<AdminInvoices />} />
        <Route path="addons" element={<AdminAddons />} />
        <Route path="promos" element={<AdminPromos />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="administrators" element={<AdminAdministrators />} />
        <Route path="administrators/roles" element={<AdminAdministrators />} />
        <Route path="administrators/logs" element={<AdminAdministrators />} />
        <Route path="guide" element={<AdminGuide />} />
      </Route>
    </Routes>
  );
}
