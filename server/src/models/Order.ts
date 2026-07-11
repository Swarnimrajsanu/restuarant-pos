import mongoose, { Document, Schema } from 'mongoose';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  orderNumber: string;
  workerId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  extraCharge: number;
  extraChargeLabel: string;
  total: number;
  paymentMethod: 'cash' | 'upi' | 'card';
  createdAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker ID is required'],
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => items.length > 0,
        message: 'Order must contain at least one item',
      },
    },
    total: {
      type: Number,
      required: true,
      min: [0, 'Total cannot be negative'],
    },
    extraCharge: {
      type: Number,
      default: 0,
    },
    extraChargeLabel: {
      type: String,
      default: '',
    },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required'],
      enum: {
        values: ['cash', 'upi', 'card'],
        message: '{VALUE} is not a valid payment method',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
orderSchema.index({ workerId: 1, createdAt: -1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentMethod: 1 });

// Generate order number before validate: ORD-YYYYMMDD-XXX
orderSchema.pre('validate', async function (next) {
  if (this.isNew) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
    
    // Find the latest order number for today
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
    
    const lastOrder = await mongoose.model('Order').findOne(
      { createdAt: { $gte: startOfDay, $lt: endOfDay } },
      { orderNumber: 1 },
      { sort: { createdAt: -1 } }
    );

    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastSequence = parseInt(lastOrder.orderNumber.split('-').pop() || '0', 10);
      sequence = lastSequence + 1;
    }

    this.orderNumber = `ORD-${dateStr}-${String(sequence).padStart(3, '0')}`;
  }
  next();
});

const Order = mongoose.model<IOrder>('Order', orderSchema);
export default Order;
