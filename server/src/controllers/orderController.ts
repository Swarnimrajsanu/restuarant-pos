import { Response } from 'express';
import Order from '../models/Order';
import { AuthRequest } from '../middleware/auth';

/**
 * POST /api/orders
 * Create a new order
 */
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, total, paymentMethod, extraCharge, extraChargeLabel } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Order must contain at least one item' });
      return;
    }

    if (!paymentMethod) {
      res.status(400).json({ message: 'Payment method is required' });
      return;
    }

    if (total === undefined || total <= 0) {
      res.status(400).json({ message: 'Total must be greater than 0' });
      return;
    }

    // Validate each item
    for (const item of items) {
      if (!item.productId || !item.name || item.price === undefined || !item.quantity) {
        res.status(400).json({ message: 'Each item must have productId, name, price, and quantity' });
        return;
      }
    }

    const order = new Order({
      workerId: req.user!._id,
      items,
      total,
      paymentMethod,
      extraCharge: extraCharge || 0,
      extraChargeLabel: extraChargeLabel || '',
    });

    await order.save();

    // Populate worker info for response
    await order.populate('workerId', 'name email');

    res.status(201).json(order);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ message: messages.join(', ') });
      return;
    }
    console.error('CreateOrder error:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

/**
 * GET /api/orders
 * List all orders with filters (owner only)
 */
export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, date, startDate, endDate, paymentMethod, page = '1', limit = '50' } = req.query;
    const filter: any = {};

    // Date filter
    if (date) {
      const d = new Date(date as string);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: startOfDay, $lt: endOfDay };
    } else if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      };
    }

    // Payment method filter
    if (paymentMethod && paymentMethod !== 'all') {
      filter.paymentMethod = paymentMethod;
    }

    // Search by order number
    if (search) {
      filter.orderNumber = { $regex: search as string, $options: 'i' };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate('workerId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      pagination: {
        total: totalCount,
        page: pageNum,
        pages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error('GetOrders error:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};

/**
 * GET /api/orders/my
 * Get today's orders for the logged-in worker
 */
export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      workerId: req.user!._id,
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    })
      .sort({ createdAt: -1 })
      .populate('workerId', 'name');

    res.json(orders);
  } catch (error) {
    console.error('GetMyOrders error:', error);
    res.status(500).json({ message: 'Server error fetching your orders' });
  }
};

/**
 * GET /api/orders/:id
 * Get a single order by ID
 */
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('workerId', 'name email');

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Workers can only see their own orders
    if (req.user!.role === 'worker' && order.workerId._id.toString() !== req.user!._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this order' });
      return;
    }

    res.json(order);
  } catch (error) {
    console.error('GetOrder error:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};
