import { Router } from 'express';
import * as contactController from '../controllers/contact.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/active', asyncHandler(contactController.getActive));
router.get('/', authenticate, authorizeAdmin, asyncHandler(contactController.getAll));
router.post('/', authenticate, authorizeAdmin, validate(contactController.createContactSchema), asyncHandler(contactController.create));
router.put('/:id', authenticate, authorizeAdmin, asyncHandler(contactController.update));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(contactController.remove));

export default router;
