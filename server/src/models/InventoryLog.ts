import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryLog extends Document {
  workerId: mongoose.Types.ObjectId;
  workerName: string;
  materialId: mongoose.Types.ObjectId;
  materialName: string;
  quantity: number;
  unit: string;
  notes?: string;
  createdAt: Date;
}

const inventoryLogSchema = new Schema<IInventoryLog>(
  {
    workerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker ID is required'],
    },
    workerName: {
      type: String,
      required: [true, 'Worker name is required'],
      trim: true,
    },
    materialId: {
      type: Schema.Types.ObjectId,
      ref: 'RawMaterial',
      required: [true, 'Material ID is required'],
    },
    materialName: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity taken must be greater than 0'],
    },
    unit: {
      type: String,
      required: [true, 'Unit of measurement is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only need creation time for logs
  }
);

// Indexes for fast querying
inventoryLogSchema.index({ createdAt: -1 });
inventoryLogSchema.index({ workerId: 1 });
inventoryLogSchema.index({ materialId: 1 });

const InventoryLog = mongoose.model<IInventoryLog>('InventoryLog', inventoryLogSchema);
export default InventoryLog;
