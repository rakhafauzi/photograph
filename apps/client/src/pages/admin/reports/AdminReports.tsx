import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, Package,
  Download, FileText, Calendar
} from 'lucide-react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import Skeleton from '@/components/ui/skeleton';
import { useFetch } from '@/hooks/useQuery';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface RevenueData {
  totalRevenue: number;
  monthly: { month: string; revenue: number }[];
  yearlyRevenue: number;
}

interface TopPackageData {
  name: string;
  category: string;
  price: number;
  totalBookings: number;
}

interface BookingReportData {
  total: number;
  monthly: { month: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
}

interface MonthlyReportData {
  year: number;
  data: { month: string; bookings: number; revenue: number; cancelled: number }[];
}

interface YearlyReportData {
  year: number;
  bookings: number;
  revenue: number;
}

type ReportTab = 'revenue' | 'bookings' | 'packages' | 'monthly' | 'yearly';

const tabs: { key: ReportTab; label: string }[] = [
  { key: 'revenue', label: 'Pendapatan' },
  { key: 'bookings', label: 'Booking' },
  { key: 'packages', label: 'Paket Terlaris' },
  { key: 'monthly', label: 'Bulanan' },
  { key: 'yearly', label: 'Tahunan' },
];

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  waiting_payment: 'Menunggu Bayar',
  processed: 'Diproses',
  confirmed: 'Dikonfirmasi',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-400',
  waiting_payment: 'bg-orange-400',
  processed: 'bg-blue-400',
  confirmed: 'bg-emerald-400',
  completed: 'bg-green-500',
  cancelled: 'bg-red-400',
};

const handleExportPDF = () => {
  toast.info('Fitur export PDF akan segera tersedia');
};

const handleExportExcel = () => {
  toast.info('Fitur export Excel akan segera tersedia');
};

export default function AdminReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('revenue');

  const { data: revenueData, isLoading: revLoading } = useFetch<RevenueData>(
    ['report-revenue'],
    '/reports/revenue'
  );

  const { data: bookingData, isLoading: bkLoading } = useFetch<BookingReportData>(
    ['report-bookings'],
    '/reports/bookings'
  );

  const { data: packagesData, isLoading: pkgLoading } = useFetch<TopPackageData[]>(
    ['report-top-packages'],
    '/reports/top-packages'
  );

  const { data: monthlyData, isLoading: monLoading } = useFetch<MonthlyReportData>(
    ['report-monthly'],
    '/reports/monthly'
  );

  const { data: yearlyData, isLoading: yrLoading } = useFetch<YearlyReportData[]>(
    ['report-yearly'],
    '/reports/yearly'
  );

  const revenue = revenueData?.data;
  const bookings = bookingData?.data;
  const topPackages = packagesData?.data || [];
  const monthly = monthlyData?.data;
  const yearly = yearlyData?.data || [];

  const maxRevenue = Math.max(...(revenue?.monthly.map(m => m.revenue) || [0]), 1);
  const maxBookings = Math.max(...(bookings?.monthly.map(m => m.count) || [0]), 1);

  const maxYearlyRevenue = Math.max(...(yearly.map(y => y.revenue) || [0]), 1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
          <p className="text-gray-500 text-sm mt-1">Analisis bisnis dan laporan keuangan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileText className="w-4 h-4 mr-1.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="w-4 h-4 mr-1.5" /> Excel
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm rounded-xl font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Pendapatan</p>
                  <p className="text-lg font-bold text-gray-900">
                    {revLoading ? <Skeleton className="h-6 w-24" /> : formatPrice(revenue?.totalRevenue || 0)}
                  </p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl theme-accent-bg-soft-strong flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 theme-accent-text" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tahun Ini</p>
                  <p className="text-lg font-bold text-gray-900">
                    {revLoading ? <Skeleton className="h-6 w-24" /> : formatPrice(revenue?.yearlyRevenue || 0)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rata-rata / Bulan</p>
                  <p className="text-lg font-bold text-gray-900">
                    {revLoading ? <Skeleton className="h-6 w-24" /> : 
                      formatPrice((revenue?.totalRevenue || 0) / Math.max(revenue?.monthly.length || 1, 1))}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Revenue Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Pendapatan Bulanan (12 Bulan)</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleExportPDF}>
                  <FileText className="w-3.5 h-3.5 mr-1" /> Export
                </Button>
              </div>
            </div>
            {revLoading ? (
              <Skeleton variant="rectangular" className="h-64" />
            ) : (
              <div className="space-y-2">
                {revenue?.monthly.map((item) => (
                  <div key={item.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.month}</span>
                      <span className="font-medium text-emerald-600">{formatPrice(item.revenue)}</span>
                    </div>
                    <div className="h-5 bg-gray-100 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <p className="text-xs text-gray-500">Total Booking</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{bkLoading ? <Skeleton className="h-8 w-16" /> : bookings?.total || 0}</p>
            </Card>
            {bookings?.statusDistribution.filter(s => s.count > 0).map((s) => (
              <Card key={s.status}>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${statusColors[s.status] || 'bg-gray-400'}`} />
                  <p className="text-xs text-gray-500">{statusLabels[s.status] || s.status}</p>
                </div>
                <p className="text-xl font-bold text-gray-900 mt-1">{s.count}</p>
              </Card>
            ))}
          </div>

          {/* Monthly Booking Chart */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Booking Bulanan (12 Bulan)</h3>
            {bkLoading ? (
              <Skeleton variant="rectangular" className="h-64" />
            ) : (
              <div className="space-y-2">
                {bookings?.monthly.map((item) => (
                  <div key={item.month} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.month}</span>
                      <span className="font-medium text-blue-600">{item.count} booking</span>
                    </div>
                    <div className="h-5 bg-gray-100 rounded-lg overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / maxBookings) * 100}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Status Distribution */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Distribusi Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {bookings?.statusDistribution.map((s) => {
                const total = bookings?.total || 1;
                const percentage = Math.round((s.count / total) * 100);
                return (
                  <div key={s.status} className="p-4 rounded-xl bg-gray-50 text-center">
                    <div className={`w-3 h-3 rounded-full ${statusColors[s.status] || 'bg-gray-400'} mx-auto mb-2`} />
                    <p className="text-xl font-bold text-gray-900">{s.count}</p>
                    <p className="text-xs text-gray-500">{statusLabels[s.status] || s.status}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{percentage}%</p>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* Top Packages Tab */}
      {activeTab === 'packages' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Paket Terlaris</h3>
          </div>
          {pkgLoading ? (
            <Skeleton variant="rectangular" className="h-64" />
          ) : topPackages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              Belum ada data paket
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Paket</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Harga</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Total Booking</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                  </tr>
                </thead>
                <tbody>
                  {topPackages.map((pkg, index) => (
                    <tr key={pkg.name} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'theme-accent-surface theme-accent-text-strong' :
                          index === 1 ? 'bg-gray-100 text-gray-600' :
                          index === 2 ? 'bg-orange-50 text-orange-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{pkg.name}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{pkg.category}</td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600">{formatPrice(pkg.price)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="font-semibold text-gray-900">{pkg.totalBookings}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600">
                        {formatPrice(pkg.price * pkg.totalBookings)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Monthly Tab */}
      {activeTab === 'monthly' && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">
              Laporan Bulanan {monthly?.year ? `- ${monthly.year}` : ''}
            </h3>
          </div>
          {monLoading ? (
            <Skeleton variant="rectangular" className="h-64" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Bulan</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Booking</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase">Dibatalkan</th>
                  </tr>
                </thead>
                <tbody>
                  {monthly?.data.map((item) => (
                    <tr key={item.month} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">{item.month}</td>
                      <td className="py-3 px-4 text-right">{item.bookings}</td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-600">{formatPrice(item.revenue)}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={item.cancelled > 0 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                          {item.cancelled}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Yearly Tab */}
      {activeTab === 'yearly' && (
        <div className="space-y-6">
          <Card>
            <h3 className="font-semibold text-gray-900 mb-4">Laporan Tahunan</h3>
            {yrLoading ? (
              <Skeleton variant="rectangular" className="h-64" />
            ) : (
              <div className="space-y-3">
                {yearly.map((item) => (
                  <div key={item.year} className="p-4 rounded-xl bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900">{item.year}</h4>
                      <Badge variant="gold">{item.bookings} Booking</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Pendapatan</span>
                      <span className="font-semibold text-emerald-600">{formatPrice(item.revenue)}</span>
                    </div>
                    <div className="mt-2 h-4 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.revenue / maxYearlyRevenue) * 100}%` }}
                        transition={{ duration: 1 }}
                        className="h-full theme-accent-gradient rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </motion.div>
  );
}
