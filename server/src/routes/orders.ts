import { Router } from 'express';
import { createOrder, getOrders, getMyOrders, getOrder } from '../controllers/orderController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// Worker gets their own today's orders
router.get('/my', protect, getMyOrders);

// Create order (any authenticated user)
router.post('/', protect, createOrder);

// Owner gets all orders
router.get('/', protect, authorize('owner'), getOrders);

// Any authenticated user can view a specific order (with ownership check in controller)
router.get('/:id', protect, getOrder);

export default router;
