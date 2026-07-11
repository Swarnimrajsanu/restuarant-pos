import { Router } from 'express';
import {
  getRawMaterials,
  createRawMaterial,
  updateRawMaterial,
  deleteRawMaterial,
  dispatchRawMaterial,
  getInventoryLogs,
  getMyInventoryLogs,
} from '../controllers/rawMaterialController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// Secure all raw materials routes with login protection
router.use(protect);

// Logs — owner sees all, worker sees only their own
router.get('/logs', authorize('owner'), getInventoryLogs);
router.get('/my-logs', getMyInventoryLogs); // worker-accessible

// Basic CRUD & Dispatch
router.route('/')
  .get(getRawMaterials)
  .post(authorize('owner'), createRawMaterial);

router.post('/dispatch', dispatchRawMaterial);

router.route('/:id')
  .put(authorize('owner'), updateRawMaterial)
  .delete(authorize('owner'), deleteRawMaterial);

export default router;
