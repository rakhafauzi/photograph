import { useState } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Skeleton from '@/components/ui/skeleton';
import { useFetch } from '@/hooks/useQuery';
import { getStatusLabel, getStatusColor } from '@/lib/utils';
import type { Booking } from '@/types';

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');

  const { data, isLoading } = useFetch<Booking[]>(
    ['admin-calendar', startOfMonth.format('YYYY-MM-DD'), endOfMonth.format('YYYY-MM-DD')],
    `/bookings/calendar?startDate=${startOfMonth.format('YYYY-MM-DD')}&endDate=${endOfMonth.format('YYYY-MM-DD')}`,
    { enabled: true }
  );

  const bookings = data?.data || [];

  // Group bookings by date
  const bookingsByDate: Record<string, Booking[]> = {};
  bookings.forEach((b: Booking) => {
    const dateKey = dayjs(b.eventDate).format('YYYY-MM-DD');
    if (!bookingsByDate[dateKey]) bookingsByDate[dateKey] = [];
    bookingsByDate[dateKey].push(b);
  });

  // Generate calendar days
  const daysInMonth = currentDate.daysInMonth();
  const firstDayOfWeek = startOfMonth.day(); // 0 = Sunday
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentDate(currentDate.subtract(1, 'month'));
  const nextMonth = () => setCurrentDate(currentDate.add(1, 'month'));

  const selectedBookings = bookingsByDate[selectedDate] || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Kalender Booking</h1>
        <p className="text-gray-500 dark:text-dark-text-secondary text-sm mt-1">Lihat jadwal booking berdasarkan tanggal</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-dark-text">
              {currentDate.format('MMMM YYYY')}
            </h2>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-hover">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day names */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-400 dark:text-dark-text-tertiary py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the 1st */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {days.map((day) => {
              const dateStr = currentDate.format('YYYY-MM') + '-' + String(day).padStart(2, '0');
              const dayBookings = bookingsByDate[dateStr] || [];
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === dayjs().format('YYYY-MM-DD');

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`relative p-3 rounded-xl text-sm transition-all ${
                    isSelected
                      ? 'theme-accent-gradient text-white shadow-theme-accent'
                      : isToday
                      ? 'theme-accent-selected theme-accent-text'
                      : 'hover:bg-gray-50 dark:hover:bg-dark-hover text-gray-700 dark:text-dark-text'
                  }`}
                >
                  <span className="font-medium">{day}</span>
                  {dayBookings.length > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isSelected ? 'bg-white theme-accent-text' : 'theme-accent-gradient text-white'
                    }`}>
                      {dayBookings.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected date bookings */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon className="w-5 h-5 theme-accent-text" />
            <h3 className="font-semibold text-gray-900 dark:text-dark-text">
              {dayjs(selectedDate).format('DD MMMM YYYY')}
            </h3>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : selectedBookings.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-dark-text-secondary text-sm">Tidak ada booking</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedBookings.map((booking: Booking) => (
                <div key={booking.id} className="p-3 rounded-xl bg-gray-50 dark:bg-dark-hover">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-semibold text-gray-500 dark:text-dark-text-secondary">
                      {booking.invoiceNumber}
                    </span>
                    <Badge className={getStatusColor(booking.status)}>
                      {getStatusLabel(booking.status)}
                    </Badge>
                  </div>
                  <p className="font-medium text-gray-900 dark:text-dark-text text-sm">{booking.name}</p>
                  <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    {booking.eventTime} WIB • {booking.package?.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </motion.div>
  );
}
