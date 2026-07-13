import { motion } from 'framer-motion';
import {
  ShoppingCart, DollarSign, Users, Camera, TrendingUp, Calendar,
  Clock, CheckCircle, XCircle, AlertCircle
} from 'lucide-react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Skeleton from '@/components/ui/skeleton';
import { useFetch } from '@/hooks/useQuery';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import type { DashboardStats, ChartData, Booking } from '@/types';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

export default function AdminDashboard() {
  const { data: statsData, isLoading: statsLoading } = useFetch<DashboardStats>(
    ['dashboard-stats'],
    '/dashboard/stats'
  );
  const { data: chartData, isLoading: chartLoading } = useFetch<ChartData[]>(
    ['dashboard-chart'],
    '/dashboard/chart'
  );
  const { data: recentData, isLoading: recentLoading } = useFetch<Booking[]>(
    ['dashboard-recent'],
    '/dashboard/recent-bookings'
  );

  const stats = statsData?.data;
  const chart = chartData?.data || [];
  const recentBookings = recentData?.data || [];

  const statCards = [
    { label: 'Total Booking', value: stats?.totalBookings || 0, icon: ShoppingCart, color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50 text-blue-600' },
    { label: 'Booking Hari Ini', value: stats?.todayBookings || 0, icon: Calendar, color: 'from-emerald-500 to-emerald-600', bgColor: 'bg-emerald-50 text-emerald-600' },
    { label: 'Booking Bulan Ini', value: stats?.monthBookings || 0, icon: TrendingUp, color: 'from-gold-400 to-gold-500', bgColor: 'bg-gold-50 text-gold-600' },
    { label: 'Pendapatan', value: formatPrice(stats?.totalRevenue || 0), icon: DollarSign, color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50 text-purple-600' },
    { label: 'Pending', value: stats?.pendingBookings || 0, icon: AlertCircle, color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50 text-orange-600' },
    { label: 'Lunas', value: stats?.paidBookings || 0, icon: CheckCircle, color: 'from-green-500 to-green-600', bgColor: 'bg-green-50 text-green-600' },
    { label: 'Total Pelanggan', value: stats?.totalCustomers || 0, icon: Users, color: 'from-cyan-500 to-cyan-600', bgColor: 'bg-cyan-50 text-cyan-600' },
    { label: 'Total Paket', value: stats?.totalPackages || 0, icon: Camera, color: 'from-rose-500 to-rose-600', bgColor: 'bg-rose-50 text-rose-600' },
  ];

  return (
    <motion.div initial="initial" animate="animate" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Dashboard</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary mt-1">Overview bisnis fotografi Anda.</p>
      </div>

      {/* Stats Cards */}
      <motion.div variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <motion.div key={stat.label} variants={fadeIn}>
            <Card>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-dark-text-secondary">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-dark-text mt-1">
                    {statsLoading ? (
                      <Skeleton className="h-8 w-20" />
                    ) : (
                      stat.value
                    )}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card>
          <h2 className="font-semibold text-gray-900 dark:text-dark-text mb-4">Grafik Booking (6 Bulan)</h2>
          {chartLoading ? (
            <Skeleton variant="rectangular" className="h-64" />
          ) : (
            <div className="space-y-3">
              {chart.map((item) => (
                <div key={item.month} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-dark-text-secondary">{item.month}</span>
                    <span className="font-medium text-gray-900 dark:text-dark-text">{item.count} booking</span>
                  </div>
                  <div className="h-3 bg-gray-100 dark:bg-dark-hover rounded-full overflow-hidden">
                    <div
                      className="h-full theme-accent-gradient rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((item.count / (Math.max(...chart.map(c => c.count), 1))) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Bookings */}
        <Card>
          <h2 className="font-semibold text-gray-900 dark:text-dark-text mb-4">Booking Terbaru</h2>
          {recentLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-dark-hover hover:bg-gray-100 dark:hover:bg-dark-hover/80 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-dark-text truncate">{booking.name}</p>
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                      {booking.package?.name} &bull; {formatDate(booking.eventDate, 'short')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(booking.status)}>
                    {getStatusLabel(booking.status)}
                  </Badge>
                </div>
              ))}
              {recentBookings.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-dark-text-tertiary text-center py-8">Belum ada booking</p>
              )}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
