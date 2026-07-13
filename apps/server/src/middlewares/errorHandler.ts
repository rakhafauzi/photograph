import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { sendError } from '../utils/response';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  if (req.path.startsWith('/api/upload')) {
    // #region debug-point E:upload-error-handler
    (() => {
      const envPath = path.join(process.cwd(), '.dbg/portfolio-upload-500.env');
      let debugUrl = 'http://127.0.0.1:7777/event';
      let sessionId = 'portfolio-upload-500';
      try {
        const env = fs.readFileSync(envPath, 'utf8');
        debugUrl = env.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || debugUrl;
        sessionId = env.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || sessionId;
      } catch {}
      fetch(debugUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          runId: 'pre-fix',
          hypothesisId: 'E',
          location: 'middlewares/errorHandler.ts:errorHandler',
          msg: '[DEBUG] Upload request failed in global error handler',
          data: {
            path: req.path,
            method: req.method,
            message: err.message,
            name: err.name,
            stack: err.stack?.split('\n').slice(0, 6).join('\n') ?? null,
            file: req.file ? {
              originalname: req.file.originalname,
              mimetype: req.file.mimetype,
              path: req.file.path,
              size: req.file.size,
            } : null,
            body: req.body,
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
    })();
    // #endregion
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
    return;
  }

  // Prisma Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 'Data already exists', 409);
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Data not found', 404);
      return;
    }
    sendError(res, 'Database error', 500);
    return;
  }

  // App Error
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Multer Error
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      sendError(res, 'Ukuran file terlalu besar. Maksimal 5MB.', 400);
      return;
    }

    sendError(res, err.message, 400);
    return;
  }

  // Upload Validation Error
  if (req.path.startsWith('/api/upload') && err.message.startsWith('Invalid file type')) {
    sendError(res, 'Format file tidak didukung. Gunakan JPG, PNG, WebP, GIF, HEIC, atau HEIF.', 400);
    return;
  }

  // Unknown Error
  sendError(res, 'Internal Server Error', 500, err.message);
};
