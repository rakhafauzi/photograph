import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendPaginated } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';

export const createTestimonialSchema = z.object({
  name: z.string().min(2),
  photo: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10),
});

export const updateTestimonialSchema = createTestimonialSchema.partial();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '10', isApproved } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { deletedAt: null };
  if (isApproved !== undefined) where.isApproved = isApproved === 'true';

  const [data, total] = await Promise.all([
    prisma.testimonial.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.testimonial.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const getApproved = async (req: Request, res: Response): Promise<void> => {
  const data = await prisma.testimonial.findMany({
    where: { isApproved: true, deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  sendSuccess(res, data);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { name, photo, rating, comment } = req.body;

  const testimonial = await prisma.testimonial.create({
    data: {
      id: generateId(),
      userId: req.user?.userId || null,
      name,
      photo: photo || null,
      rating,
      comment,
      isApproved: false,
    },
  });

  sendSuccess(res, testimonial, 'Testimonial submitted. Waiting for approval.', 201);
};

export const approve = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.testimonial.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Testimonial not found', 404);

  const data = await prisma.testimonial.update({
    where: { id },
    data: { isApproved: !existing.isApproved },
  });

  sendSuccess(res, data, `Testimonial ${data.isApproved ? 'approved' : 'disapproved'}`);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.testimonial.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Testimonial not found', 404);

  await prisma.testimonial.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  sendSuccess(res, null, 'Testimonial deleted');
};
