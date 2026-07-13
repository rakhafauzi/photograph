import { Router } from 'express';
import * as faqController from '../controllers/faq.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(faqController.getAll));
router.get('/admin', authenticate, authorizeAdmin, asyncHandler(faqController.getAllAdmin));
router.post('/', authenticate, authorizeAdmin, validate(faqController.createFaqSchema), asyncHandler(faqController.create));
router.put('/:id', authenticate, authorizeAdmin, asyncHandler(faqController.update));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(faqController.remove));

export default router;
