import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(categoryController.getAll));
router.get('/slug/:slug', asyncHandler(categoryController.getBySlug));
router.get('/:id', asyncHandler(categoryController.getById));
router.post('/', authenticate, authorizeAdmin, validate(categoryController.createCategorySchema), asyncHandler(categoryController.create));
router.put('/:id', authenticate, authorizeAdmin, asyncHandler(categoryController.update));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(categoryController.remove));

export default router;
