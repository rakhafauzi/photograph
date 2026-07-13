import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public
router.post('/track', asyncHandler(bookingController.trackBooking));
router.get('/available-dates', asyncHandler(bookingController.getBookedDates));
router.get('/public/:id', asyncHandler(bookingController.getPublicBooking));

// Customer
router.post('/', validate(bookingController.createBookingSchema), asyncHandler(bookingController.create));
router.get('/my-bookings', authenticate, asyncHandler(bookingController.getMyBookings));
router.get('/invoice/:invoiceNumber', authenticate, asyncHandler(bookingController.getByInvoice));

// Admin
router.get('/calendar', authenticate, authorizeAdmin, asyncHandler(bookingController.getCalendarEvents));
router.get('/all', authenticate, authorizeAdmin, asyncHandler(bookingController.getAll));
router.get('/:id', authenticate, asyncHandler(bookingController.getById));
router.patch('/:id/status', authenticate, authorizeAdmin, asyncHandler(bookingController.updateStatus));

export default router;
