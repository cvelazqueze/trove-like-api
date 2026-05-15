import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import { updateUserSchema, userIdParamSchema } from '../validators/user.schema';

const router = Router();

router.get('/me', asyncHandler(userController.me));
router.get('/', asyncHandler(userController.list));
router.get('/:id', validate(userIdParamSchema, 'params'), asyncHandler(userController.getById));
router.patch(
  '/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema),
  asyncHandler(userController.update),
);
router.delete('/:id', validate(userIdParamSchema, 'params'), asyncHandler(userController.delete));

export default router;
