import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma/client';
import { sendSuccess, sendPaginated } from '../utils/response';
import { generateId } from '../utils/generateId';
import { AppError } from '../middlewares/errorHandler';

export const createPackageSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2),
  price: z.number().positive(),
  description: z.string().optional(),
  duration: z.string().optional(),
  photographer: z.number().int().optional(),
  videographer: z.number().int().optional(),
  photoCount: z.number().int().optional(),
  videoCount: z.number().int().optional(),
  hasDrone: z.boolean().optional(),
  hasAlbum: z.boolean().optional(),
  hasPrint: z.boolean().optional(),
  hasFrame: z.boolean().optional(),
  hasCinematic: z.boolean().optional(),
  hasHighlight: z.boolean().optional(),
  location: z.string().optional(),
  isPopular: z.boolean().optional(),
  benefits: z.array(z.string()).optional(),
});

export const updatePackageSchema = createPackageSchema.partial();

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const search = req.query.search as string | undefined;
  const page = (req.query.page as string) || '1';
  const limit = (req.query.limit as string) || '10';
  const categoryId = req.query.categoryId as string | undefined;
  const popular = req.query.popular as string | undefined;
  const all = req.query.all as string | undefined;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const where: any = { deletedAt: null };
  if (search) where.name = { contains: search as string };
  if (categoryId) where.categoryId = categoryId as string;
  if (popular === 'true') where.isPopular = true;

  if (all === 'true') {
    const data = await prisma.package.findMany({
      where: { ...where, isActive: true },
      orderBy: { price: 'asc' },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        benefits: true,
        galleries: { orderBy: { sortOrder: 'asc' }, take: 1 },
      },
    });
    sendSuccess(res, data);
    return;
  }

  const [data, total] = await Promise.all([
    prisma.package.findMany({
      where,
      orderBy: { price: 'asc' },
      skip,
      take: limitNum,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        benefits: true,
        galleries: { orderBy: { sortOrder: 'asc' }, take: 1 },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.package.count({ where }),
  ]);

  sendPaginated(res, data, total, pageNum, limitNum);
};

export const getBySlug = async (req: Request, res: Response): Promise<void> => {
  const { slug } = req.params;
  const data = await prisma.package.findFirst({
    where: { slug, deletedAt: null, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      benefits: { orderBy: { createdAt: 'asc' } },
      galleries: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!data) throw new AppError('Package not found', 404);
  sendSuccess(res, data);
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const data = await prisma.package.findFirst({
    where: { id, deletedAt: null },
    include: {
      category: true,
      benefits: true,
      galleries: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!data) throw new AppError('Package not found', 404);
  sendSuccess(res, data);
};

export const create = async (req: Request, res: Response): Promise<void> => {
  const { categoryId, name, price, description, duration, photographer, videographer, photoCount, videoCount, hasDrone, hasAlbum, hasPrint, hasFrame, hasCinematic, hasHighlight, location, isPopular, benefits } = req.body;

  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + generateId().slice(0, 8);

  const pkg = await prisma.package.create({
    data: {
      id: generateId(),
      categoryId,
      name,
      slug,
      price,
      description,
      duration,
      photographer: photographer || 1,
      videographer: videographer || 0,
      photoCount: photoCount || 0,
      videoCount: videoCount || 0,
      hasDrone: hasDrone || false,
      hasAlbum: hasAlbum || false,
      hasPrint: hasPrint || false,
      hasFrame: hasFrame || false,
      hasCinematic: hasCinematic || false,
      hasHighlight: hasHighlight || false,
      location,
      isPopular: isPopular || false,
      benefits: benefits ? {
        create: benefits.map((b: string) => ({
          id: generateId(),
          benefit: b,
        })),
      } : undefined,
    },
    include: { benefits: true, category: { select: { id: true, name: true } } },
  });

  sendSuccess(res, pkg, 'Package created', 201);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.package.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Package not found', 404);

  const { benefits, ...updateData } = req.body;

  if (updateData.name) {
    updateData.slug = updateData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + generateId().slice(0, 8);
  }

  if (benefits) {
    await prisma.packageBenefit.deleteMany({ where: { packageId: id } });
    await prisma.packageBenefit.createMany({
      data: benefits.map((b: string) => ({
        id: generateId(),
        packageId: id,
        benefit: b,
      })),
    });
  }

  const pkg = await prisma.package.update({
    where: { id },
    data: updateData,
    include: { benefits: true, category: { select: { id: true, name: true } } },
  });

  sendSuccess(res, pkg, 'Package updated');
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const existing = await prisma.package.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new AppError('Package not found', 404);

  await prisma.package.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  sendSuccess(res, null, 'Package deleted');
};

export const addGallery = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { images } = req.body;

  if (!Array.isArray(images) || images.length === 0) {
    throw new AppError('Images array is required', 400);
  }

  const galleries = await Promise.all(
    images.map((image: string, index: number) =>
      prisma.packageGallery.create({
        data: {
          id: generateId(),
          packageId: id,
          image,
          sortOrder: index,
        },
      })
    )
  );

  sendSuccess(res, galleries, 'Gallery images added', 201);
};
