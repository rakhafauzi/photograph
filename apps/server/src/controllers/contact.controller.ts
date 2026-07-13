import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';

export const createContactSchema = z.object({
  type: z.enum(['whatsapp', 'instagram', 'facebook', 'tiktok', 'email', 'google_maps']),
  label: z.string().min(2),
  value: z.string().min(1),
  icon: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const data = await prisma.contact.findMany({
    orderBy: { createdAt: 'asc' },
  });

  sendSuccess(res, data);
};

export const getActive = async (req: Request, res: Response): Promise<void> => {
  const data = await prisma.contact.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'asc' },
  });

  sendSuccess(res, data);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const data = await prisma.contact.create({
    data: { id: generateId(), ...req.body },
  });

  sendSuccess(res, data, 'Contact created', 201);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) throw new AppError('Contact not found', 404);

  const data = await prisma.contact.update({ where: { id }, data: req.body });
  sendSuccess(res, data, 'Contact updated');
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) throw new AppError('Contact not found', 404);

  await prisma.contact.delete({ where: { id } });
  sendSuccess(res, null, 'Contact deleted');
};
