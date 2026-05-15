import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { asyncHandler } from '../middleware/asyncHandler';
import { validate } from '../middleware/validate';
import {
  createProductSchema,
  productIdParamSchema,
  trendingQuerySchema,
  updateProductSchema,
} from '../validators/product.schema';

const router = Router();

router.get('/trending', validate(trendingQuerySchema, 'query'), asyncHandler(productController.trending));
router.post('/', validate(createProductSchema), asyncHandler(productController.create));
router.get('/', asyncHandler(productController.list));
router.get('/:id', validate(productIdParamSchema, 'params'), asyncHandler(productController.getById));
router.patch(
  '/:id',
  validate(productIdParamSchema, 'params'),
  validate(updateProductSchema),
  asyncHandler(productController.update),
);
router.delete('/:id', validate(productIdParamSchema, 'params'), asyncHandler(productController.delete));

export default router;
