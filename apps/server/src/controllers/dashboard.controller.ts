import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { sendSuccess } from '../utils/response';
import dayjs from 'dayjs';

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  const today = dayjs().startOf('day').toDate();
  const endOfToday = dayjs().endOf('day').toDate();
  const startOfMonth = dayjs().startOf('month').toDate();
  const endOfMonth = dayjs().endOf('month').toDate();

  const [
    totalBookings,
    todayBookings,
    monthBookings,
    pendingBookings,
    paidBookings,
    cancelledBookings,
    revenue,
    monthRevenue,
    totalCustomers,
    totalPackages,
    waitingPayments,
    todayEvents,
  ] = await Promise.all([
    prisma.booking.count({ where: { deletedAt: null } }),
    prisma.booking.count({
      where: {
        deletedAt: null,
        eventDate: { gte: today, lte: endOfToday },
      },
    }),
    prisma.booking.count({
      where: {
        deletedAt: null,
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
    }),
    prisma.booking.count({
      where: { deletedAt: null, status: 'pending' },
    }),
    prisma.booking.count({
      where: { deletedAt: null, paymentStatus: 'paid' },
    }),
    prisma.booking.count({
      where: { deletedAt: null, status: 'cancelled' },
    }),
    prisma.booking.aggregate({
      where: { deletedAt: null, paymentStatus: 'paid' },
      _sum: { totalPrice: true },
    }),
    prisma.booking.aggregate({
      where: {
        deletedAt: null,
        paymentStatus: 'paid',
        createdAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { totalPrice: true },
    }),
    prisma.user.count({ where: { role: 'customer', deletedAt: null } }),
    prisma.package.count({ where: { isActive: true, deletedAt: null } }),
    prisma.payment.count({
      where: { status: 'waiting_verification' },
    }),
    prisma.booking.findMany({
      where: {
        deletedAt: null,
        eventDate: { gte: today, lte: endOfToday },
        status: { notIn: ['cancelled'] },
      },
      orderBy: { eventTime: 'asc' },
      select: {
        id: true,
        name: true,
        eventTime: true,
        eventDate: true,
        status: true,
        package: { select: { name: true } },
      },
    }),
  ]);

  sendSuccess(res, {
    totalBookings,
    todayBookings,
    monthBookings,
    pendingBookings,
    paidBookings,
    cancelledBookings,
    totalRevenue: revenue._sum.totalPrice || 0,
    monthRevenue: monthRevenue._sum.totalPrice || 0,
    totalCustomers,
    totalPackages,
    waitingPayments,
    todayEvents,
  });
};

export const getBookingChart = async (_req: Request, res: Response): Promise<void> => {
  const months = 6;
  const chartData: { month: string; count: number; revenue: number }[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const start = dayjs().subtract(i, 'month').startOf('month').toDate();
    const end = dayjs().subtract(i, 'month').endOf('month').toDate();

    const [count, revenue] = await Promise.all([
      prisma.booking.count({
        where: {
          deletedAt: null,
          createdAt: { gte: start, lte: end },
        },
      }),
      prisma.booking.aggregate({
        where: {
          deletedAt: null,
          paymentStatus: 'paid',
          createdAt: { gte: start, lte: end },
        },
        _sum: { totalPrice: true },
      }),
    ]);

    chartData.push({
      month: dayjs(start).format('MMM YYYY'),
      count,
      revenue: revenue._sum.totalPrice || 0,
    });
  }

  sendSuccess(res, chartData);
};

export const getRecentBookings = async (_req: Request, res: Response): Promise<void> => {
  const data = await prisma.booking.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      package: {
        select: { id: true, name: true, category: { select: { name: true } } },
      },
    },
  });

  sendSuccess(res, data);
};

export const getStatusDistribution = async (_req: Request, res: Response): Promise<void> => {
  const statuses = ['pending', 'waiting_payment', 'processed', 'confirmed', 'completed', 'cancelled', 'done'];
  const paymentStatuses = ['unpaid', 'waiting_verification', 'paid', 'rejected'];

  const [bookingStatusCounts, paymentStatusCounts] = await Promise.all([
    Promise.all(
      statuses.map((status) =>
        prisma.booking.count({ where: { deletedAt: null, status } })
      )
    ),
    Promise.all(
      paymentStatuses.map((status) =>
        prisma.booking.count({ where: { deletedAt: null, paymentStatus: status } })
      )
    ),
  ]);

  sendSuccess(res, {
    bookingStatus: statuses.map((s, i) => ({ status: s, count: bookingStatusCounts[i] })),
    paymentStatus: paymentStatuses.map((s, i) => ({ status: s, count: paymentStatusCounts[i] })),
  });
};
