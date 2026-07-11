import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProduct,
} from '../controllers/productController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// All authenticated users can view products
router.get('/', protect, getProducts);

// Owner only
router.post('/', protect, authorize('owner'), createProduct);
router.put('/:id', protect, authorize('owner'), updateProduct);
router.delete('/:id', protect, authorize('owner'), deleteProduct);
router.patch('/:id/toggle', protect, authorize('owner'), toggleProduct);

export default router;
