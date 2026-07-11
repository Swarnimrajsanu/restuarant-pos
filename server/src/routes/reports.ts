import { Router } from 'express';
import {
  getDashboardStats,
  getDailyReport,
  getMonthlyReport,
  getChartDaily,
  getChartPayment,
} from '../controllers/reportController';
import { protect } from '../middleware/auth';
import { authorize } from '../middleware/rbac';

const router = Router();

// All report routes are owner-only
router.use(protect, authorize('owner'));

router.get('/dashboard', getDashboardStats);
router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/chart/daily', getChartDaily);
router.get('/chart/payment', getChartPayment);

export default router;
