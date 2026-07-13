import { Router } from 'express';
import * as testimonialController from '../controllers/testimonial.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/approved', asyncHandler(testimonialController.getApproved));
router.get('/', authenticate, authorizeAdmin, asyncHandler(testimonialController.getAll));
router.post('/', validate(testimonialController.createTestimonialSchema), asyncHandler(testimonialController.create));
router.patch('/:id/approve', authenticate, authorizeAdmin, asyncHandler(testimonialController.approve));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(testimonialController.remove));

export default router;
