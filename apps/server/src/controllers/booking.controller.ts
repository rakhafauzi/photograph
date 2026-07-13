import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendPaginated } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';
import dayjs from 'dayjs';

const DEFAULT_BOOKING_TIME_SLOTS = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

export const createBookingSchema = z.object({
  packageId: z.string().uuid(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(8),
  address: z.string().optional(),
  eventLocation: z.string().optional(),
  eventDate: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  eventTime: z.string(),
  notes: z.string().optional(),
});

const generateInvoiceNumber = (): string => {
  const date = dayjs().format('YYYYMMDD');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${date}-${random}`;
};

const parseJsonArray = (value: string | null, fallback: string[]): string[] => {
  if (!value) return fallback;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const getBookingAvailabilitySettings = async () => {
  const rows = await prisma.websiteSetting.findMany({
    where: {
      key: {
        in: [
          'booking_time_slots',
          'booking_blackout_dates',
          'booking_max_per_slot',
          'booking_window_days',
          'booking_advance_notice_days',
        ],
      },
    },
  });

  const settings = rows.reduce<Record<string, string | null>>((acc, row) => {
    acc[row.key] = row.value;
    return acc;
  }, {});

  const timeSlots = parseJsonArray(settings.booking_time_slots, DEFAULT_BOOKING_TIME_SLOTS)
    .map((slot) => String(slot).trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const blackoutDates = new Set(
    parseJsonArray(settings.booking_blackout_dates, [])
      .map((date) => String(date).trim())
      .filter(Boolean)
  );
  const maxPerSlot = Math.max(Number(settings.booking_max_per_slot || '1') || 1, 1);
  const windowDays = Math.max(Number(settings.booking_window_days || '30') || 30, 1);
  const advanceNoticeDays = Math.max(Number(settings.booking_advance_notice_days || '0') || 0, 0);

  return {
    timeSlots: timeSlots.length > 0 ? timeSlots : DEFAULT_BOOKING_TIME_SLOTS,
    blackoutDates,
    maxPerSlot,
    windowDays,
    advanceNoticeDays,
  };
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { search, page = '1', limit = '10', status, paymentStatus, startDate, endDate, packageId } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { deletedAt: null };
  if (search) {
    where.OR = [
      { name: { contains: search as string } },
      { email: { contains: search as string } },
      { phone: { contains: search as string } },
      { invoiceNumber: { contains: search as string } },
    ];
  }
  if (status) where.status = status as string;
  if (paymentStatus) where.paymentStatus = paymentStatus as string;
  if (packageId) where.packageId = packageId as string;
  if (startDate && endDate) {
    where.eventDate = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        package: {
          select: { id: true, name: true, price: true, category: { select: { name: true } } },
        },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const getMyBookings = async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '10', status } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {
    userId: req.user?.userId,
    deletedAt: null,
  };
  if (status) where.status = status as string;

  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        package: {
          select: { id: true, name: true, price: true, category: { select: { name: true, slug: true } } },
        },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const getByInvoice = async (req: Request, res: Response): Promise<void> => {
  const { invoiceNumber } = req.params;
  const data = await prisma.booking.findFirst({
    where: { invoiceNumber, deletedAt: null },
    include: {
      package: {
        include: {
          category: true,
          benefits: true,
        },
      },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!data) throw new AppError('Booking not found', 404);

  // If user is customer, verify ownership
  if (req.user?.role === 'customer' && data.userId !== req.user.userId) {
    throw new AppError('Access denied', 403);
  }

  sendSuccess(res, data);
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await prisma.booking.findFirst({
    where: { id, deletedAt: null },
    include: {
      package: {
        include: {
          category: true,
          benefits: true,
        },
      },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!data) throw new AppError('Booking not found', 404);
  sendSuccess(res, data);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { packageId, name, email, phone, address, eventLocation, eventDate, eventTime, notes } = req.body;

  const pkg = await prisma.package.findFirst({
    where: { id: packageId, isActive: true, deletedAt: null },
  });

  if (!pkg) throw new AppError('Package not found', 404);

  const availability = await getBookingAvailabilitySettings();
  const normalizedEventDate = dayjs(eventDate).startOf('day');
  const eventDateKey = normalizedEventDate.format('YYYY-MM-DD');
  const minBookingDate = dayjs().add(availability.advanceNoticeDays, 'day').startOf('day');
  const maxBookingDate = minBookingDate.add(Math.max(availability.windowDays - 1, 0), 'day').endOf('day');

  if (!availability.timeSlots.includes(eventTime)) {
    throw new AppError('Selected time slot is not available', 400);
  }

  if (availability.blackoutDates.has(eventDateKey)) {
    throw new AppError('Selected date is unavailable for booking', 400);
  }

  if (normalizedEventDate.isBefore(minBookingDate, 'day')) {
    throw new AppError('Selected date is earlier than the allowed booking window', 400);
  }

  if (normalizedEventDate.isAfter(maxBookingDate, 'day')) {
    throw new AppError('Selected date exceeds the active booking window', 400);
  }

  const existingSlotCount = await prisma.booking.count({
    where: {
      deletedAt: null,
      status: { not: 'cancelled' },
      eventTime,
      eventDate: {
        gte: normalizedEventDate.startOf('day').toDate(),
        lte: normalizedEventDate.endOf('day').toDate(),
      },
    },
  });

  if (existingSlotCount >= availability.maxPerSlot) {
    throw new AppError('Selected time slot is already full', 400);
  }

  const downPayment = pkg.price * 0.3; // 30% down payment
  const remainingPayment = pkg.price - downPayment;

  const booking = await prisma.booking.create({
    data: {
      id: generateId(),
      invoiceNumber: generateInvoiceNumber(),
      userId: req.user?.userId || null,
      packageId,
      name,
      email,
      phone,
      address,
      eventLocation,
      eventDate: new Date(eventDate),
      eventTime,
      notes,
      totalPrice: pkg.price,
      downPayment,
      remainingPayment,
      status: 'pending',
      paymentStatus: 'unpaid',
    },
    include: {
      package: {
        select: { id: true, name: true, price: true, category: { select: { name: true } } },
      },
    },
  });

  sendSuccess(res, booking, 'Booking created successfully', 201);
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, cancellationReason } = req.body;

  const booking = await prisma.booking.findFirst({ where: { id, deletedAt: null } });
  if (!booking) throw new AppError('Booking not found', 404);

  const updateData: any = { status };
  if (status === 'cancelled') {
    updateData.cancellationReason = cancellationReason || null;
  }

  const data = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      package: { select: { id: true, name: true, price: true } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  });

  sendSuccess(res, data, 'Booking status updated');
};

export const getPublicBooking = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await prisma.booking.findFirst({
    where: { id, deletedAt: null },
    select: {
      id: true,
      invoiceNumber: true,
      name: true,
      email: true,
      phone: true,
      eventDate: true,
      eventTime: true,
      totalPrice: true,
      downPayment: true,
      remainingPayment: true,
      status: true,
      paymentStatus: true,
      packageId: true,
      package: {
        select: {
          id: true,
          name: true,
          price: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!data) throw new AppError('Booking not found', 404);
  sendSuccess(res, data);
};

export const trackBooking = async (req: Request, res: Response): Promise<void> => {
  const { invoiceNumber, email } = req.body;

  const booking = await prisma.booking.findFirst({
    where: { invoiceNumber, email, deletedAt: null },
    include: {
      package: {
        select: { id: true, name: true, price: true, category: { select: { name: true } } },
      },
      payments: {
        select: { id: true, amount: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!booking) throw new AppError('Booking not found. Check invoice number and email.', 404);

  sendSuccess(res, booking);
};

export const getCalendarEvents = async (req: Request, res: Response): Promise<void> => {
  const { startDate, endDate } = req.query;

  const where: any = {
    deletedAt: null,
    status: { notIn: ['cancelled', 'pending'] },
  };

  if (startDate && endDate) {
    where.eventDate = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string),
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { eventDate: 'asc' },
    select: {
      id: true,
      invoiceNumber: true,
      name: true,
      eventDate: true,
      eventTime: true,
      status: true,
      package: { select: { name: true, category: { select: { name: true } } } },
    },
  });

  sendSuccess(res, bookings);
};

export const getBookedDates = async (req: Request, res: Response): Promise<void> => {
  const { month, year, startDate, endDate } = req.query;

  const start = startDate
    ? dayjs(startDate as string).startOf('day')
    : dayjs(`${year}-${month}-01`).startOf('month');
  const end = endDate
    ? dayjs(endDate as string).endOf('day')
    : dayjs(`${year}-${month}-01`).endOf('month');

  const bookings = await prisma.booking.findMany({
    where: {
      deletedAt: null,
      status: { not: 'cancelled' },
      eventDate: {
        gte: start.toDate(),
        lte: end.toDate(),
      },
    },
    select: {
      eventDate: true,
      eventTime: true,
    },
  });

  // Group by date
  const bookedDates: Record<string, string[]> = {};
  bookings.forEach((b) => {
    const dateKey = dayjs(b.eventDate).format('YYYY-MM-DD');
    if (!bookedDates[dateKey]) bookedDates[dateKey] = [];
    bookedDates[dateKey].push(b.eventTime);
  });

  sendSuccess(res, bookedDates);
};
