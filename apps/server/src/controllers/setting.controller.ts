import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

export const getAll = async (req: Request, res: Response): Promise<void> => {
  const settings = await prisma.websiteSetting.findMany();
  const result: Record<string, string | null> = {};
  settings.forEach((s) => {
    result[s.key] = s.value;
  });

  sendSuccess(res, result);
};

export const getByKey = async (req: Request, res: Response): Promise<void> => {
  const { key } = req.params;
  const setting = await prisma.websiteSetting.findUnique({ where: { key } });
  if (!setting) throw new AppError('Setting not found', 404);

  sendSuccess(res, setting);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const settings = req.body; // { key: value, ... }

  const updates = await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      prisma.websiteSetting.upsert({
        where: { key },
        update: { value: value as string },
        create: { key, value: value as string },
      })
    )
  );

  sendSuccess(res, updates, 'Settings updated');
};

export const set = async (req: Request, res: Response): Promise<void> => {
  const { key, value } = req.body;

  const setting = await prisma.websiteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  sendSuccess(res, setting, 'Setting saved');
};
