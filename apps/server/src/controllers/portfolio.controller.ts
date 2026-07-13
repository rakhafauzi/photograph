import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendPaginated } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';

export const createPortfolioSchema = z.object({
  categoryId: z.string().uuid().optional().nullable(),
  title: z.string().min(2),
  description: z.string().optional(),
  coverImage: z.string(),
  images: z.array(z.string()).optional(),
});

export const updatePortfolioSchema = createPortfolioSchema.partial();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const { search, page = '1', limit = '12', categoryId } = req.query;
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { deletedAt: null, isActive: true };
  if (search) where.title = { contains: search as string };
  if (categoryId) where.categoryId = categoryId as string;

  const [data, total] = await Promise.all([
    prisma.portfolio.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { images: true } },
      },
    }),
    prisma.portfolio.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const getBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const data = await prisma.portfolio.findFirst({
    where: { slug, deletedAt: null },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!data) throw new AppError('Portfolio not found', 404);
  sendSuccess(res, data);
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await prisma.portfolio.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!data) throw new AppError('Portfolio not found', 404);
  sendSuccess(res, data);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { categoryId, title, description, coverImage, images } = req.body;
  const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + generateId().slice(0, 8);

  const portfolio = await prisma.portfolio.create({
    data: {
      id: generateId(),
      categoryId,
      title,
      slug,
      description,
      coverImage,
      images: images ? {
        create: images.map((img: string, index: number) => ({
          id: generateId(),
          image: img,
          sortOrder: index,
        })),
      } : undefined,
    },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  sendSuccess(res, portfolio, 'Portfolio created', 201);
};

export const addImages = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { images } = req.body;

  const portfolio = await prisma.portfolio.findFirst({ where: { id, deletedAt: null } });
  if (!portfolio) throw new AppError('Portfolio not found', 404);

  const lastImage = await prisma.portfolioImage.findFirst({
    where: { portfolioId: id },
    orderBy: { sortOrder: 'desc' },
  });

  let startOrder = (lastImage?.sortOrder || 0) + 1;

  const created = await Promise.all(
    images.map((image: string) =>
      prisma.portfolioImage.create({
        data: {
          id: generateId(),
          portfolioId: id,
          image,
          sortOrder: startOrder++,
        },
      })
    )
  );

  sendSuccess(res, created, 'Images added', 201);
};

export const removeImage = async (req: Request, res: Response): Promise<void> => {
  const { id, imageId } = req.params;
  await prisma.portfolioImage.delete({
    where: { id: imageId },
  });

  sendSuccess(res, null, 'Image removed');
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.portfolio.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Portfolio not found', 404);

  const { title, ...updateData } = req.body;
  if (title) {
    updateData.title = title;
    updateData.slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + generateId().slice(0, 8);
  }

  const data = await prisma.portfolio.update({
    where: { id },
    data: updateData,
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { sortOrder: 'asc' } },
    },
  });

  sendSuccess(res, data, 'Portfolio updated');
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.portfolio.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Portfolio not found', 404);

  await prisma.portfolio.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  sendSuccess(res, null, 'Portfolio deleted');
};
