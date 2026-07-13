import { Router } from 'express';
import * as portfolioController from '../controllers/portfolio.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(portfolioController.getAll));
router.get('/slug/:slug', asyncHandler(portfolioController.getBySlug));
router.get('/:id', asyncHandler(portfolioController.getById));
router.post('/', authenticate, authorizeAdmin, asyncHandler(portfolioController.create));
router.put('/:id', authenticate, authorizeAdmin, asyncHandler(portfolioController.update));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(portfolioController.remove));
router.post('/:id/images', authenticate, authorizeAdmin, asyncHandler(portfolioController.addImages));
router.delete('/:id/images/:imageId', authenticate, authorizeAdmin, asyncHandler(portfolioController.removeImage));

export default router;
