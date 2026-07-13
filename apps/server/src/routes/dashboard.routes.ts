import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/stats', authenticate, authorizeAdmin, asyncHandler(dashboardController.getStats));
router.get('/chart', authenticate, authorizeAdmin, asyncHandler(dashboardController.getBookingChart));
router.get('/recent-bookings', authenticate, authorizeAdmin, asyncHandler(dashboardController.getRecentBookings));
router.get('/status-distribution', authenticate, authorizeAdmin, asyncHandler(dashboardController.getStatusDistribution));

export default router;
