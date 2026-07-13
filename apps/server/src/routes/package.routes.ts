import { Router } from 'express';
import * as packageController from '../controllers/package.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(packageController.getAll));
router.get('/slug/:slug', asyncHandler(packageController.getBySlug));
router.get('/:id', asyncHandler(packageController.getById));
router.post('/', authenticate, authorizeAdmin, validate(packageController.createPackageSchema), asyncHandler(packageController.create));
router.put('/:id', authenticate, authorizeAdmin, asyncHandler(packageController.update));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(packageController.remove));
router.post('/:id/gallery', authenticate, authorizeAdmin, asyncHandler(packageController.addGallery));

export default router;
