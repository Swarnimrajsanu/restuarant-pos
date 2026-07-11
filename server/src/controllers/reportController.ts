import { Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/reports/dashboard
 * Get today's dashboard statistics
 */
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayFilter = { createdAt: { $gte: startOfDay, $lt: endOfDay } };

    // Aggregate today's stats
    const stats = await Order.aggregate([
      { $match: todayFilter },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          cashTotal: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$total', 0] },
          },
          upiTotal: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'upi'] }, '$total', 0] },
          },
          cardTotal: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$total', 0] },
          },
          cashOrders: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, 1, 0] },
          },
          upiOrders: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'upi'] }, 1, 0] },
          },
          cardOrders: {
            $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, 1, 0] },
          },
        },
      },
    ]);

    const result = stats[0] || {
      totalRevenue: 0,
      totalOrders: 0,
      cashTotal: 0,
      upiTotal: 0,
      cardTotal: 0,
      cashOrders: 0,
      upiOrders: 0,
      cardOrders: 0,
    };

    res.json(result);
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    res.status(500).json({ message: 'Server error fetching dashboard stats' });
  }
};

/**
 * GET /api/reports/daily?date=YYYY-MM-DD
 * Get daily sales report
 */
export const getDailyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const dateStr = req.query.date as string;
    const date = dateStr ? new Date(dateStr) : new Date();

    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    })
      .populate('workerId', 'name')
      .sort({ createdAt: -1 });

    // Summary stats
    const summary = orders.reduce(
      (acc, order) => {
        acc.totalRevenue += order.total;
        acc.totalOrders += 1;
        if (order.paymentMethod === 'cash') acc.cashTotal += order.total;
        if (order.paymentMethod === 'upi') acc.upiTotal += order.total;
        if (order.paymentMethod === 'card') acc.cardTotal += order.total;
        return acc;
      },
      { totalRevenue: 0, totalOrders: 0, cashTotal: 0, upiTotal: 0, cardTotal: 0 }
    );

    res.json({ date: startOfDay.toISOString().slice(0, 10), summary, orders });
  } catch (error) {
    console.error('GetDailyReport error:', error);
    res.status(500).json({ message: 'Server error fetching daily report' });
  }
};

/**
 * GET /api/reports/monthly?month=1-12&year=YYYY
 * Get monthly sales report
 */
export const getMonthlyReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month as string, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year as string, 10) || now.getFullYear();

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 1);

    // Aggregate daily stats for the month
    const dailyStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lt: endOfMonth },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          cash: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'cash'] }, '$total', 0] } },
          upi: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'upi'] }, '$total', 0] } },
          card: { $sum: { $cond: [{ $eq: ['$paymentMethod', 'card'] }, '$total', 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Monthly totals
    const summary = dailyStats.reduce(
      (acc, day) => {
        acc.totalRevenue += day.revenue;
        acc.totalOrders += day.orders;
        acc.cashTotal += day.cash;
        acc.upiTotal += day.upi;
        acc.cardTotal += day.card;
        return acc;
      },
      { totalRevenue: 0, totalOrders: 0, cashTotal: 0, upiTotal: 0, cardTotal: 0 }
    );

    res.json({ month, year, summary, dailyStats });
  } catch (error) {
    console.error('GetMonthlyReport error:', error);
    res.status(500).json({ message: 'Server error fetching monthly report' });
  }
};

/**
 * GET /api/reports/chart/daily
 * Get last 7 days sales data for charts
 */
export const getChartDaily = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days with 0
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const found = dailyData.find((dd) => dd._id === dateStr);
      result.push({
        date: dateStr,
        label: dayLabel,
        revenue: found?.revenue || 0,
        orders: found?.orders || 0,
      });
    }

    res.json(result);
  } catch (error) {
    console.error('GetChartDaily error:', error);
    res.status(500).json({ message: 'Server error fetching chart data' });
  }
};

/**
 * GET /api/reports/chart/payment
 * Get payment method distribution for today
 */
export const getChartPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const paymentData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        },
      },
      {
        $group: {
          _id: '$paymentMethod',
          total: { $sum: '$total' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Format for pie chart
    const colorMap: Record<string, string> = {
      cash: '#22c55e',
      upi: '#8b5cf6',
      card: '#3b82f6',
    };

    const result = ['cash', 'upi', 'card'].map((method) => {
      const found = paymentData.find((p) => p._id === method);
      return {
        name: method.charAt(0).toUpperCase() + method.slice(1),
        value: found?.total || 0,
        count: found?.count || 0,
        color: colorMap[method],
      };
    });

    res.json(result);
  } catch (error) {
    console.error('GetChartPayment error:', error);
    res.status(500).json({ message: 'Server error fetching payment chart data' });
  }
};
