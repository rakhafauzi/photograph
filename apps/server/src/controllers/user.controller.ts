import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendPaginated } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';

export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
  role: z.enum(['photographer', 'videographer', 'editor', 'admin', 'freelance', 'customer']).default('admin'),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  phone: z.string().optional(),
  role: z.enum(['photographer', 'videographer', 'editor', 'admin', 'freelance', 'customer']).optional(),
  isActive: z.boolean().optional(),
});

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const pageNum = parseInt(req.query.page as string) || 1;
  const limitNum = parseInt(req.query.limit as string) || 20;
  const skip = (pageNum - 1) * limitNum;

  const where: Record<string, any> = { deletedAt: null };
  
  const roleVal = req.query.role as string | undefined;
  if (roleVal) where.role = roleVal;
  
  const searchVal = req.query.search as string | undefined;
  if (searchVal) {
    where.OR = [
      { name: { contains: searchVal } },
      { email: { contains: searchVal } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatar: true,
        isActive: true,
        createdAt: true,
        _count: { select: { bookings: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const user = await prisma.user.findFirst({
    where: { id: req.params.id, deletedAt: null },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      isActive: true,
      createdAt: true,
      _count: { select: { bookings: true } },
    },
  });

  if (!user) throw new AppError('User not found', 404);
  sendSuccess(res, user);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const body = req.body as any;
  const { name, email, password, phone, role } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already registered', 400);

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      id: generateId(),
      name,
      email,
      password: hashedPassword,
      phone: phone || null,
      role: role || 'admin',
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  sendSuccess(res, user, 'User created successfully', 201);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateBody = req.body as any;
  const updates: Record<string, any> = {};
  
  if (updateBody.name !== undefined) updates.name = updateBody.name;
  if (updateBody.email !== undefined) updates.email = updateBody.email;
  if (updateBody.phone !== undefined) updates.phone = updateBody.phone;
  if (updateBody.role !== undefined) updates.role = updateBody.role;
  if (updateBody.isActive !== undefined) updates.isActive = updateBody.isActive;
  if (updateBody.password) {
    updates.password = await bcrypt.hash(updateBody.password, 12);
  }

  const existing = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('User not found', 404);

  const user = await prisma.user.update({
    where: { id },
    data: updates,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  sendSuccess(res, user, 'User updated successfully');
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.user.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('User not found', 404);

  if (id === req.user?.userId) {
    throw new AppError('Cannot delete yourself', 400);
  }

  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  sendSuccess(res, null, 'User deleted successfully');
};
