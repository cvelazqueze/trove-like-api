import { Router } from 'express';
import { collectionController } from '../controllers/collection.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import {
  addProductSchema,
  collectionIdParamSchema,
  collectionProductParamSchema,
  createCollectionSchema,
  updateCollectionSchema,
} from '../validators/collection.schema';

const router = Router();

router.post('/', validate(createCollectionSchema), asyncHandler(collectionController.create));
router.get('/', asyncHandler(collectionController.list));
router.get('/:id', validate(collectionIdParamSchema, 'params'), asyncHandler(collectionController.getById));
router.patch(
  '/:id',
  validate(collectionIdParamSchema, 'params'),
  validate(updateCollectionSchema),
  asyncHandler(collectionController.update),
);
router.delete('/:id', validate(collectionIdParamSchema, 'params'), asyncHandler(collectionController.delete));
router.post(
  '/:id/products',
  validate(collectionIdParamSchema, 'params'),
  validate(addProductSchema),
  asyncHandler(collectionController.addProduct),
);
router.delete(
  '/:id/products/:productId',
  validate(collectionProductParamSchema, 'params'),
  asyncHandler(collectionController.removeProduct),
);

export default router;
