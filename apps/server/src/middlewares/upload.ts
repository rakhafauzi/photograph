import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const uploadDir = config.upload.dir;
    // Ensure upload directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    // #region debug-point A:upload-filefilter-accept
    (() => {
      const envPath = path.join(process.cwd(), '.dbg/portfolio-upload-500.env');
      let debugUrl = 'http://127.0.0.1:7777/event';
      let sessionId = 'portfolio-upload-500';
      try {
        const env = require('fs').readFileSync(envPath, 'utf8');
        debugUrl = env.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || debugUrl;
        sessionId = env.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || sessionId;
      } catch {}
      fetch(debugUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          runId: 'pre-fix',
          hypothesisId: 'A',
          location: 'middlewares/upload.ts:fileFilter:accept',
          msg: '[DEBUG] Upload file accepted by multer filter',
          data: {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size ?? null,
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
    })();
    // #endregion
    cb(null, true);
  } else {
    // #region debug-point A:upload-filefilter-reject
    (() => {
      const envPath = path.join(process.cwd(), '.dbg/portfolio-upload-500.env');
      let debugUrl = 'http://127.0.0.1:7777/event';
      let sessionId = 'portfolio-upload-500';
      try {
        const env = require('fs').readFileSync(envPath, 'utf8');
        debugUrl = env.match(/DEBUG_SERVER_URL=(.+)/)?.[1] || debugUrl;
        sessionId = env.match(/DEBUG_SESSION_ID=(.+)/)?.[1] || sessionId;
      } catch {}
      fetch(debugUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          runId: 'pre-fix',
          hypothesisId: 'A',
          location: 'middlewares/upload.ts:fileFilter:reject',
          msg: '[DEBUG] Upload file rejected by multer filter',
          data: {
            originalname: file.originalname,
            mimetype: file.mimetype,
          },
          ts: Date.now(),
        }),
      }).catch(() => {});
    })();
    // #endregion
    cb(new Error('Invalid file type. Only JPEG, PNG, WebP, GIF, HEIC, and HEIF are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxFileSize,
  },
});

export const uploadMultiple = (fieldName: string, maxCount = 10) =>
  upload.array(fieldName, maxCount);
