import { Router } from 'express';
import * as settingController from '../controllers/setting.controller';
import { authenticate, authorizeAdmin } from '../middlewares/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(settingController.getAll));
router.get('/:key', asyncHandler(settingController.getByKey));
router.put('/', authenticate, authorizeAdmin, asyncHandler(settingController.update));
router.post('/', authenticate, authorizeAdmin, asyncHandler(settingController.set));

export default router;
