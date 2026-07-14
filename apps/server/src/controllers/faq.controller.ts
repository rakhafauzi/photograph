import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendPaginated } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';

export const createFaqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(5),
  sortOrder: z.number().int().optional(),
});

export const updateFaqSchema = createFaqSchema.partial();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { deletedAt: null, isActive: true };

  const [data, total] = await Promise.all([
    prisma.faq.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limitNum,
    }),
    prisma.faq.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const getAllAdmin = async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { deletedAt: null };

  const [data, total] = await Promise.all([
    prisma.faq.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limitNum,
    }),
    prisma.faq.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = await prisma.faq.create({
    data: {
      id: generateId(),
      ...(req.body as any),
      sortOrder: (req.body as any).sortOrder || 0,
    },
  });

  sendSuccess(res, data, 'FAQ created', 201);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.faq.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('FAQ not found', 404);

  const data = await prisma.faq.update({ where: { id }, data: req.body as any });
  sendSuccess(res, data, 'FAQ updated');
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.faq.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('FAQ not found', 404);

  await prisma.faq.update({ where: { id }, data: { deletedAt: new Date() } });
  sendSuccess(res, null, 'FAQ deleted');
};
