import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/revenue', authenticate, authorizeAdmin, asyncHandler(reportController.getRevenueReport));
router.get('/bookings', authenticate, authorizeAdmin, asyncHandler(reportController.getBookingReport));
router.get('/top-packages', authenticate, authorizeAdmin, asyncHandler(reportController.getTopPackages));
router.get('/monthly', authenticate, authorizeAdmin, asyncHandler(reportController.getMonthlyReport));
router.get('/yearly', authenticate, authorizeAdmin, asyncHandler(reportController.getYearlyReport));

export default router;
