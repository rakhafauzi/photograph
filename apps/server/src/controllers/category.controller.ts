import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendPaginated } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';

export const createCategorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { search, page = '1', limit = '10', all } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { deletedAt: null };
  if (search) {
    where.name = { contains: search as string };
  }

  if (all === 'true') {
    const data = await prisma.category.findMany({
      where: { ...where, isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        packages: {
          where: { isActive: true, deletedAt: null },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            benefits: { orderBy: { createdAt: 'asc' } },
            galleries: { orderBy: { sortOrder: 'asc' }, take: 1 },
            _count: { select: { bookings: true } },
          },
          orderBy: { price: 'asc' },
        },
        _count: { select: { packages: true, portfolios: true } },
      },
    });
    sendSuccess(res, data);
    return;
  }

  const [data, total] = await Promise.all([
    prisma.category.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      skip,
      take: limitNum,
      include: { _count: { select: { packages: true, portfolios: true } } },
    }),
    prisma.category.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const getBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const data = await prisma.category.findFirst({
    where: { slug, deletedAt: null },
    include: {
      packages: {
        where: { isActive: true, deletedAt: null },
        include: {
          benefits: true,
          galleries: { orderBy: { sortOrder: 'asc' }, take: 1 },
          _count: { select: { bookings: true } },
        },
        orderBy: { price: 'asc' },
      },
      _count: { select: { packages: true, portfolios: true } },
    },
  });

  if (!data) throw new AppError('Category not found', 404);
  sendSuccess(res, data);
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await prisma.category.findFirst({
    where: { id, deletedAt: null },
    include: {
      packages: {
        where: { isActive: true, deletedAt: null },
        include: { benefits: true },
        orderBy: { price: 'asc' },
      },
    },
  });

  if (!data) throw new AppError('Category not found', 404);
  sendSuccess(res, data);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { name, description, icon, image, sortOrder } = req.body;
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) throw new AppError('Category with this name already exists', 400);

  const data = await prisma.category.create({
    data: {
      id: generateId(),
      name,
      slug,
      description,
      icon,
      image,
      sortOrder: sortOrder || 0,
    },
  });

  sendSuccess(res, data, 'Category created', 201);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, description, icon, image, sortOrder, isActive } = req.body;

  const existing = await prisma.category.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Category not found', 404);

  const updateData: any = {};
  if (name !== undefined) {
    updateData.name = name;
    updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
  if (description !== undefined) updateData.description = description;
  if (icon !== undefined) updateData.icon = icon;
  if (image !== undefined) updateData.image = image;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  if (isActive !== undefined) updateData.isActive = isActive;

  const data = await prisma.category.update({ where: { id }, data: updateData });
  sendSuccess(res, data, 'Category updated');
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.category.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Category not found', 404);

  await prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  sendSuccess(res, null, 'Category deleted');
};
