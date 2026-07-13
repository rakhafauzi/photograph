import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.post('/single', authenticate, authorizeAdmin, upload.single('file'), asyncHandler(uploadController.uploadSingle));
router.post('/multiple', authenticate, authorizeAdmin, upload.array('files', 20), asyncHandler(uploadController.uploadMultipleFiles));
router.delete('/delete', authenticate, authorizeAdmin, asyncHandler(uploadController.deleteFile));

export default router;
