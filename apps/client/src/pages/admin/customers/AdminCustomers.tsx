import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Users, Search, Phone, Mail, ChevronRight
} from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Modal from '@/components/ui/modal';
import { TableSkeleton } from '@/components/ui/skeleton';
import { useFetchList } from '@/hooks/useQuery';
import { formatPrice, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils';
import type { Booking, User } from '@/types';
import api from '@/services/api';

interface CustomerWithStats extends User {
  _count?: { bookings: number };
  totalSpent?: number;
  bookings?: Booking[];
  lastBooking?: string;
}

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithStats | null>(null);

  // Fetch all booking data to derive customer info
  const { data: bookingsData, isLoading } = useFetchList<Booking>(
    ['admin-customers-bookings'],
    '/bookings/all',
    { limit: '100' }
  );

  const bookings = bookingsData?.data || [];

  // Group bookings by email to create customer records
  const customerMap = new Map<string, CustomerWithStats>();
  bookings.forEach((b: Booking) => {
    const key = b.email;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: b.id,
        name: b.name,
        email: b.email,
        phone: b.phone,
        role: 'customer',
        _count: { bookings: 0 },
        totalSpent: 0,
        bookings: [],
        createdAt: b.createdAt,
      });
    }
    const customer = customerMap.get(key)!;
    customer._count!.bookings += 1;
    customer.totalSpent = (customer.totalSpent || 0) + b.totalPrice;
    customer.bookings = [...(customer.bookings || []), b].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    customer.lastBooking = b.createdAt;
  });

  const customers = Array.from(customerMap.values())
    .filter((c) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone || '').includes(q);
    })
    .sort((a, b) => (b._count?.bookings || 0) - (a._count?.bookings || 0));

  const meta = { total: customers.length, totalPages: Math.ceil(customers.length / 20) };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Customer</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Kelola data customer dan riwayat booking</p>
      </div>

      <Card>
        {/* Search */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Cari nama, email, atau no. WhatsApp..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              icon={<Search className="w-4 h-4" />}
            />
          </div>            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-dark-text-secondary">
            <Users className="w-4 h-4" />
            <span>{customers.length} customer</span>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada customer</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-dark-border">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Customer</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Kontak</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Total Booking</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Total Transaksi</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Terakhir Booking</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr
                      key={customer.email}
                      className="border-b border-gray-50 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-hover transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl theme-accent-gradient-br flex items-center justify-center text-white font-semibold text-sm">
                            {customer.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-dark-text">{customer.name}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-text-secondary">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <a
                          href={`https://wa.me/${customer.phone || ''}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-dark-text-secondary hover:text-emerald-600 transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {customer.phone}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 font-semibold text-sm">
                          {customer._count?.bookings || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-dark-text">
                        {formatPrice(customer.totalSpent || 0)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 dark:text-dark-text-secondary">
                        {customer.lastBooking ? formatDate(customer.lastBooking, 'short') : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedCustomer(customer); }}
                          className="p-2 rounded-lg text-gray-400 dark:text-dark-text-tertiary hover:text-gold-600 hover:bg-gold-50 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {customers.map((customer) => (
                <div
                  key={customer.email}
                  className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl theme-accent-gradient-br flex items-center justify-center text-white font-semibold">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.email}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{customer._count?.bookings || 0} booking</span>
                    <span>{formatPrice(customer.totalSpent || 0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Customer Detail Modal */}
      <Modal
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || 'Detail Customer'}
        size="lg"
      >
        {selectedCustomer && (
          <div className="space-y-4">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 rounded-xl theme-accent-bg-soft-strong">
              <div className="w-14 h-14 rounded-xl theme-accent-gradient flex items-center justify-center text-white font-bold text-lg shadow-sm">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{selectedCustomer.name}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {selectedCustomer.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {selectedCustomer.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-blue-50">
                <p className="text-xs text-blue-600 font-medium">Total Booking</p>
                <p className="text-2xl font-bold text-blue-700 mt-1">{selectedCustomer._count?.bookings || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50">
                <p className="text-xs text-emerald-600 font-medium">Total Transaksi</p>
                <p className="text-lg font-bold text-emerald-700 mt-1">{formatPrice(selectedCustomer.totalSpent || 0)}</p>
              </div>
            </div>

            {/* Booking History */}
            <div>
              <h4 className="font-semibold text-gray-900 text-sm mb-3">Riwayat Booking</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {(selectedCustomer.bookings || []).map((booking) => (
                  <Link
                    key={booking.id}
                    to={`/admin/bookings/${booking.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.package?.name || 'Paket'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(booking.eventDate, 'short')} • {booking.eventTime}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </Link>
                ))}
                {(selectedCustomer.bookings || []).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Belum ada booking</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
