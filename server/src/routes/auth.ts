import { Router } from 'express';
import {
  login,
  register,
  getMe,
  getWorkers,
  updateWorker,
  deleteWorker,
  getPublicWorkers,
  workerLogin,
  updateProfile,
} from '../controllers/authController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// Public auth endpoints
router.post('/login', login);
router.get('/public/workers', getPublicWorkers);
router.post('/worker-login', workerLogin);

// Protected auth endpoints
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);  // owner/worker updates own credentials
router.post('/register', protect, authorize('owner'), register);
router.get('/workers', protect, authorize('owner'), getWorkers);
router.put('/workers/:id', protect, authorize('owner'), updateWorker);
router.delete('/workers/:id', protect, authorize('owner'), deleteWorker);

export default router;
