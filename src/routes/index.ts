import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import productRoutes from './product.routes';
import collectionRoutes from './collection.routes';

const router = Router();

router.use('/auth', authRoutes);

router.use(authenticate);

router.use('/users', userRoutes);
router.use('/products', productRoutes);
router.use('/collections', collectionRoutes);

export default router;
