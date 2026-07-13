import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { upload } from '../middlewares/upload';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, authorizeAdmin, asyncHandler(paymentController.getAll));
router.get('/:id', authenticate, asyncHandler(paymentController.getById));

// Public endpoint for customers to upload payment proof
router.post('/', upload.single('proofImage'), asyncHandler(paymentController.createPublic));

router.patch('/:id/verify', authenticate, authorizeAdmin, asyncHandler(paymentController.verifyPayment));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(paymentController.remove));

export default router;
