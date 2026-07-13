import { Request, Response } from 'express';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { sendSuccess } from '../utils/response';
import { AppError } from '../middlewares/errorHandler';

const execFileAsync = promisify(execFile);
const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);
const PASSTHROUGH_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.jfif']);

const resizeForWebp = (imageProcessor: sharp.Sharp, width?: number) => {
  if (!width || width <= 1920) {
    return imageProcessor;
  }

  return imageProcessor.resize(1920, undefined, {
    fit: 'inside',
    withoutEnlargement: true,
  });
};

const convertHeicToJpegWithSips = async (sourcePath: string) => {
  const fallbackPath = path.join(
    path.dirname(sourcePath),
    `${path.basename(sourcePath, path.extname(sourcePath))}-heic-fallback.jpg`
  );

  await execFileAsync('sips', ['-s', 'format', 'jpeg', sourcePath, '--out', fallbackPath]);

  return fallbackPath;
};

const convertImageToWebp = async ({
  sourcePath,
  finalPath,
  sourceExt,
  width,
}: {
  sourcePath: string;
  finalPath: string;
  sourceExt: string;
  width?: number;
}) => {
  let fallbackPath: string | null = null;

  try {
    await resizeForWebp(sharp(sourcePath), width).webp({ quality: 80 }).toFile(finalPath);
    return;
  } catch (error) {
    const isHeicSource = HEIC_EXTENSIONS.has(sourceExt);
    if (!isHeicSource || process.platform !== 'darwin') {
      throw error;
    }

    fallbackPath = await convertHeicToJpegWithSips(sourcePath);
    const fallbackMetadata = await sharp(fallbackPath).metadata();
    await resizeForWebp(sharp(fallbackPath), fallbackMetadata.width)
      .webp({ quality: 80 })
      .toFile(finalPath);
  } finally {
    if (fallbackPath && fs.existsSync(fallbackPath)) {
      fs.unlinkSync(fallbackPath);
    }
  }
};

const keepOriginalUpload = ({
  tempPath,
  destPath,
  originalname,
  mimetype,
}: {
  tempPath: string;
  destPath: string;
  originalname: string;
  mimetype: string;
}) => {
  if (tempPath !== destPath) {
    fs.renameSync(tempPath, destPath);
  }

  return {
    url: destPath,
    filename: path.basename(destPath),
    originalname,
    size: fs.statSync(destPath).size,
    mimetype,
  };
};

export const uploadSingle = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    throw new AppError('No file uploaded', 400);
  }

  const { folder = 'general' } = req.body;
  const allowedFolders = ['portfolio', 'package', 'testimonial', 'payment', 'logo', 'general'];

  // #region debug-point B:upload-single-entry
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
        hypothesisId: 'B',
        location: 'controllers/upload.controller.ts:uploadSingle:entry',
        msg: '[DEBUG] Upload single entered',
        data: {
          folder,
          originalname: req.file?.originalname,
          mimetype: req.file?.mimetype,
          tempPath: req.file?.path,
          size: req.file?.size,
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
  })();
  // #endregion

  if (!allowedFolders.includes(folder)) {
    // Remove uploaded file
    fs.unlinkSync(req.file.path);
    throw new AppError('Invalid upload folder', 400);
  }

  // Move file to the correct folder
  const destDir = path.join(__dirname, '../../uploads', folder);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const filename = `${path.basename(req.file.filename, ext)}${ext}`;
  const destPath = path.join(destDir, filename);

  // Convert to WebP for better compression (keep original for payment receipts)
  let finalPath = destPath;
  if (folder !== 'payment' && ext !== '.gif') {
    finalPath = path.join(destDir, `${path.basename(filename, ext)}.webp`);
    try {
      const metadata = await sharp(req.file.path).metadata();

      // #region debug-point C:upload-single-metadata
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
            hypothesisId: 'C',
            location: 'controllers/upload.controller.ts:uploadSingle:metadata',
            msg: '[DEBUG] Upload metadata resolved',
            data: {
              folder,
              ext,
              width: metadata.width ?? null,
              height: metadata.height ?? null,
              format: metadata.format ?? null,
              space: metadata.space ?? null,
              hasAlpha: metadata.hasAlpha ?? null,
            },
            ts: Date.now(),
          }),
        }).catch(() => {});
      })();
      // #endregion

      // #region debug-point D:upload-single-convert
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
            hypothesisId: 'D',
            location: 'controllers/upload.controller.ts:uploadSingle:convert',
            msg: '[DEBUG] Upload converting image to webp',
            data: {
              folder,
              ext,
              sourcePath: req.file?.path,
              finalPath,
            },
            ts: Date.now(),
          }),
        }).catch(() => {});
      })();
      // #endregion

      await convertImageToWebp({
        sourcePath: req.file.path,
        finalPath,
        sourceExt: ext,
        width: metadata.width,
      });

      if (req.file.path !== finalPath) {
        fs.unlinkSync(req.file.path);
      }

      sendSuccess(res, {
        url: `/uploads/${folder}/${path.basename(finalPath)}`,
        filename: path.basename(finalPath),
        originalname: req.file.originalname,
        size: fs.statSync(finalPath).size,
        mimetype: 'image/webp',
      }, 'File uploaded successfully');
    } catch (error) {
      if (!PASSTHROUGH_EXTENSIONS.has(ext)) {
        throw error;
      }

      finalPath = destPath;
      const originalFile = keepOriginalUpload({
        tempPath: req.file.path,
        destPath: finalPath,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
      });

      sendSuccess(res, {
        url: `/uploads/${folder}/${originalFile.filename}`,
        filename: originalFile.filename,
        originalname: originalFile.originalname,
        size: originalFile.size,
        mimetype: originalFile.mimetype,
      }, 'File uploaded successfully');
    }
  } else {
    // Move file to destination
    fs.renameSync(req.file.path, finalPath);

    sendSuccess(res, {
      url: `/uploads/${folder}/${filename}`,
      filename,
      originalname: req.file.originalname,
      size: fs.statSync(finalPath).size,
      mimetype: req.file.mimetype,
    }, 'File uploaded successfully');
  }

  // #region debug-point E:upload-single-success
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
        location: 'controllers/upload.controller.ts:uploadSingle:success',
        msg: '[DEBUG] Upload single finished successfully',
        data: {
          folder,
          originalname: req.file?.originalname,
          outputPath: finalPath,
        },
        ts: Date.now(),
      }),
    }).catch(() => {});
  })();
  // #endregion
};

export const uploadMultipleFiles = async (req: Request, res: Response): Promise<void> => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const { folder = 'general' } = req.body;
  const allowedFolders = ['portfolio', 'package', 'testimonial', 'payment', 'logo', 'general'];

  if (!allowedFolders.includes(folder)) {
    req.files.forEach((f) => fs.unlinkSync(f.path));
    throw new AppError('Invalid upload folder', 400);
  }

  const destDir = path.join(__dirname, '../../uploads', folder);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const files = req.files as Express.Multer.File[];
  const uploaded = await Promise.all(
    files.map(async (file) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const filename = `${path.basename(file.filename, ext)}${ext}`;
      const destPath = path.join(destDir, filename);

      let finalPath = destPath;
      if (folder !== 'payment' && ext !== '.gif') {
        finalPath = path.join(destDir, `${path.basename(filename, ext)}.webp`);
        try {
          const metadata = await sharp(file.path).metadata();
          await convertImageToWebp({
            sourcePath: file.path,
            finalPath,
            sourceExt: ext,
            width: metadata.width,
          });
          if (file.path !== finalPath) fs.unlinkSync(file.path);
        } catch (error) {
          if (!PASSTHROUGH_EXTENSIONS.has(ext)) {
            throw error;
          }

          finalPath = destPath;
          keepOriginalUpload({
            tempPath: file.path,
            destPath: finalPath,
            originalname: file.originalname,
            mimetype: file.mimetype,
          });
        }
      } else {
        fs.renameSync(file.path, finalPath);
      }

      return {
        url: `/uploads/${folder}/${path.basename(finalPath)}`,
        filename: path.basename(finalPath),
        originalname: file.originalname,
      };
    })
  );

  sendSuccess(res, uploaded, 'Files uploaded successfully');
};

export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  const { fileUrl } = req.body;

  if (!fileUrl) {
    throw new AppError('File URL is required', 400);
  }

  const filePath = path.join(__dirname, '../../', fileUrl);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    sendSuccess(res, null, 'File deleted');
  } else {
    sendSuccess(res, null, 'File not found');
  }
};
