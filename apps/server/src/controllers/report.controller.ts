import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { sendSuccess } from '../utils/response';
import dayjs from 'dayjs';

export const getRevenueReport = async (_req: Request, res: Response): Promise<void> => {
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const start = dayjs().subtract(i, 'month').startOf('month').toDate();
    const end = dayjs().subtract(i, 'month').endOf('month').toDate();
    
    const result = await prisma.booking.aggregate({
      where: {
        deletedAt: null,
        paymentStatus: 'paid',
        createdAt: { gte: start, lte: end },
      },
      _sum: { totalPrice: true },
    });

    monthly.push({
      month: dayjs(start).format('MMM YYYY'),
      revenue: result._sum.totalPrice || 0,
    });
  }

  const totalRevenue = monthly.reduce((sum, m) => sum + m.revenue, 0);

  // Yearly
  const yearlyStart = dayjs().startOf('year').toDate();
  const yearlyEnd = dayjs().endOf('year').toDate();
  const yearlyResult = await prisma.booking.aggregate({
    where: {
      deletedAt: null,
      paymentStatus: 'paid',
      createdAt: { gte: yearlyStart, lte: yearlyEnd },
    },
    _sum: { totalPrice: true },
  });

  sendSuccess(res, {
    totalRevenue,
    monthly,
    yearlyRevenue: yearlyResult._sum.totalPrice || 0,
  });
};

export const getTopPackages = async (_req: Request, res: Response): Promise<void> => {
  const packages = await prisma.package.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      price: true,
      _count: { select: { bookings: true } },
      category: { select: { name: true } },
    },
    orderBy: { bookings: { _count: 'desc' } },
    take: 10,
  });

  const data = packages.map((p) => ({
    name: p.name,
    category: p.category?.name || '-',
    price: p.price,
    totalBookings: p._count.bookings,
  }));

  sendSuccess(res, data);
};

export const getBookingReport = async (_req: Request, res: Response): Promise<void> => {
  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const start = dayjs().subtract(i, 'month').startOf('month').toDate();
    const end = dayjs().subtract(i, 'month').endOf('month').toDate();
    
    const count = await prisma.booking.count({
      where: {
        deletedAt: null,
        createdAt: { gte: start, lte: end },
      },
    });

    monthly.push({
      month: dayjs(start).format('MMM YYYY'),
      count,
    });
  }

  const statusDistribution = await Promise.all(
    ['pending', 'waiting_payment', 'processed', 'confirmed', 'completed', 'cancelled'].map(async (status) => {
      const count = await prisma.booking.count({
        where: { deletedAt: null, status },
      });
      return { status, count };
    })
  );

  sendSuccess(res, {
    total: monthly.reduce((sum, m) => sum + m.count, 0),
    monthly,
    statusDistribution,
  });
};

export const getMonthlyReport = async (req: Request, res: Response): Promise<void> => {
  const year = parseInt(req.query.year as string) || dayjs().year();
  
  const monthlyData = [];
  for (let month = 0; month < 12; month++) {
    const start = dayjs().year(year).month(month).startOf('month').toDate();
    const end = dayjs().year(year).month(month).endOf('month').toDate();
    
    const [bookings, revenue, cancelled] = await Promise.all([
      prisma.booking.count({
        where: { deletedAt: null, createdAt: { gte: start, lte: end } },
      }),
      prisma.booking.aggregate({
        where: {
          deletedAt: null,
          paymentStatus: 'paid',
          createdAt: { gte: start, lte: end },
        },
        _sum: { totalPrice: true },
      }),
      prisma.booking.count({
        where: {
          deletedAt: null,
          status: 'cancelled',
          createdAt: { gte: start, lte: end },
        },
      }),
    ]);

    monthlyData.push({
      month: dayjs(start).format('MMMM'),
      bookings,
      revenue: revenue._sum.totalPrice || 0,
      cancelled,
    });
  }

  sendSuccess(res, {
    year,
    data: monthlyData,
  });
};

export const getYearlyReport = async (_req: Request, res: Response): Promise<void> => {
  const years = [];
  const currentYear = dayjs().year();
  
  for (let year = currentYear - 4; year <= currentYear; year++) {
    const start = dayjs().year(year).startOf('year').toDate();
    const end = dayjs().year(year).endOf('year').toDate();
    
    const [bookings, revenue] = await Promise.all([
      prisma.booking.count({
        where: { deletedAt: null, createdAt: { gte: start, lte: end } },
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

    years.push({
      year,
      bookings,
      revenue: revenue._sum.totalPrice || 0,
    });
  }

  sendSuccess(res, years);
};
