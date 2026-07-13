import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendPaginated } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';

export const uploadPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  amount: z.number().positive(),
  paymentMethod: z.string().optional(),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  transferDate: z.string().optional(),
  notes: z.string().optional(),
});

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '10', status, bookingId } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = {};
  if (status) where.status = status as string;
  if (bookingId) where.bookingId = bookingId as string;

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        booking: {
          select: {
            id: true,
            invoiceNumber: true,
            name: true,
            totalPrice: true,
            status: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await prisma.payment.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          package: { select: { id: true, name: true, price: true } },
        },
      },
    },
  });

  if (!data) throw new AppError('Payment not found', 404);
  sendSuccess(res, data);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { bookingId, amount, paymentMethod, bankName, accountName, accountNumber, transferDate, notes } = req.body;

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, deletedAt: null },
  });

  if (!booking) throw new AppError('Booking not found', 404);

  const proofImage = req.file ? `/uploads/${req.file.filename}` : null;

  const payment = await prisma.payment.create({
    data: {
      id: generateId(),
      bookingId,
      amount,
      paymentMethod: paymentMethod || null,
      proofImage,
      bankName,
      accountName,
      accountNumber,
      transferDate: transferDate ? new Date(transferDate) : null,
      notes,
      status: 'waiting_verification',
    },
  });

  // Update booking payment status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: 'waiting_verification', status: 'waiting_payment' },
  });

  sendSuccess(res, payment, 'Payment uploaded successfully', 201);
};

export const createPublic = async (req: Request, res: Response): Promise<void> => {
  const { bookingId, amount, paymentMethod, bankName, accountName, accountNumber, transferDate, notes } = req.body;

  if (!bookingId) throw new AppError('Booking ID is required', 400);

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, deletedAt: null },
  });

  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.paymentStatus === 'paid') {
    throw new AppError('This booking is already paid', 400);
  }

  const proofImage = req.file ? `/uploads/${req.file.filename}` : null;

  if (!proofImage) {
    throw new AppError('Payment proof image is required', 400);
  }

  // Parse amount from form data
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    throw new AppError('Invalid payment amount', 400);
  }

  const payment = await prisma.payment.create({
    data: {
      id: generateId(),
      bookingId,
      amount: parsedAmount,
      paymentMethod: paymentMethod || null,
      proofImage,
      bankName: bankName || null,
      accountName: accountName || null,
      accountNumber: accountNumber || null,
      transferDate: transferDate ? new Date(transferDate) : null,
      notes: notes || null,
      status: 'waiting_verification',
    },
  });

  // Update booking payment status
  await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: 'waiting_verification', status: 'waiting_payment' },
  });

  sendSuccess(res, payment, 'Payment proof uploaded successfully', 201);
};

export const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { booking: true },
  });

  if (!payment) throw new AppError('Payment not found', 404);

  const updateData: any = {
    status,
    verifiedBy: req.user?.userId,
    verifiedAt: new Date(),
  };
  if (notes !== undefined) updateData.notes = notes;

  await prisma.payment.update({
    where: { id },
    data: updateData,
  });

  // Update booking payment status
  if (status === 'verified') {
    // Check if this completes the payment
    const totalPaid = await prisma.payment.aggregate({
      where: { bookingId: payment.bookingId, status: 'verified' },
      _sum: { amount: true },
    });

    const bookingTotal = payment.booking.totalPrice;
    const paidAmount = totalPaid._sum.amount || 0;

    if (paidAmount >= bookingTotal) {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'paid', status: 'confirmed' },
      });
    } else {
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { paymentStatus: 'paid' },
      });
    }
  } else if (status === 'rejected') {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { paymentStatus: 'rejected' },
    });
  }

  sendSuccess(res, null, `Payment ${status === 'verified' ? 'verified' : 'rejected'} successfully`);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) throw new AppError('Payment not found', 404);

  await prisma.payment.delete({ where: { id } });
  sendSuccess(res, null, 'Payment deleted');
};
