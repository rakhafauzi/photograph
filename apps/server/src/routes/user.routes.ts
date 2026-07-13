import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middlewares/validate';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', authenticate, authorizeAdmin, asyncHandler(userController.getAll));
router.get('/:id', authenticate, authorizeAdmin, asyncHandler(userController.getById));
router.post('/', authenticate, authorizeAdmin, validate(userController.createUserSchema), asyncHandler(userController.create));
router.put('/:id', authenticate, authorizeAdmin, asyncHandler(userController.update));
router.delete('/:id', authenticate, authorizeAdmin, asyncHandler(userController.remove));

export default router;
