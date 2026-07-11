import mongoose, { Document, Schema } from 'mongoose';

export interface IRawMaterial extends Document {
  name: string;
  quantity: number;
  unit: string;
  sellerName: string;
  price: number; // Purchase price per unit
  minStockLevel: number; // Threshold for low stock alert
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rawMaterialSchema = new Schema<IRawMaterial>(
  {
    name: {
      type: String,
      required: [true, 'Raw material name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true,
      default: 'Kg', // e.g. Kg, Liters, Packets, Bags
    },
    sellerName: {
      type: String,
      required: [true, 'Seller name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      default: 0,
    },
    minStockLevel: {
      type: Number,
      default: 5,
      min: [0, 'Minimum stock level cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
rawMaterialSchema.index({ name: 1 });
rawMaterialSchema.index({ sellerName: 1 });

const RawMaterial = mongoose.model<IRawMaterial>('RawMaterial', rawMaterialSchema);
export default RawMaterial;
