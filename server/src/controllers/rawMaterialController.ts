import { Response } from 'express';
import RawMaterial from '../models/RawMaterial';
import InventoryLog from '../models/InventoryLog';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/raw-materials
 * Get list of all raw materials (owner and worker)
 */
export const getRawMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    let query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sellerName: { $regex: search, $options: 'i' } },
      ];
    }

    const materials = await RawMaterial.find(query).sort({ name: 1 });
    res.json(materials);
  } catch (error) {
    console.error('GetRawMaterials error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/raw-materials
 * Add new raw material (owner only)
 */
export const createRawMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, quantity, unit, sellerName, price, minStockLevel, notes } = req.body;

    if (!name || quantity === undefined || !unit || !sellerName || price === undefined) {
      res.status(400).json({ message: 'Please provide name, quantity, unit, seller name, and price' });
      return;
    }

    const material = await RawMaterial.create({
      name,
      quantity,
      unit,
      sellerName,
      price,
      minStockLevel: minStockLevel !== undefined ? minStockLevel : 5,
      notes,
    });

    res.status(201).json(material);
  } catch (error) {
    console.error('CreateRawMaterial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * PUT /api/raw-materials/:id
 * Update raw material details (owner only)
 */
export const updateRawMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, quantity, unit, sellerName, price, minStockLevel, notes } = req.body;
    const material = await RawMaterial.findById(req.params.id);

    if (!material) {
      res.status(404).json({ message: 'Raw material item not found' });
      return;
    }

    if (name !== undefined) material.name = name;
    if (quantity !== undefined) material.quantity = quantity;
    if (unit !== undefined) material.unit = unit;
    if (sellerName !== undefined) material.sellerName = sellerName;
    if (price !== undefined) material.price = price;
    if (minStockLevel !== undefined) material.minStockLevel = minStockLevel;
    if (notes !== undefined) material.notes = notes;

    await material.save();
    res.json(material);
  } catch (error) {
    console.error('UpdateRawMaterial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE /api/raw-materials/:id
 * Delete raw material item (owner only)
 */
export const deleteRawMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const material = await RawMaterial.findByIdAndDelete(req.params.id);

    if (!material) {
      res.status(404).json({ message: 'Raw material item not found' });
      return;
    }

    res.json({ message: 'Raw material item deleted successfully' });
  } catch (error) {
    console.error('DeleteRawMaterial error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * POST /api/raw-materials/dispatch
 * Take raw material from inventory (owner and worker)
 */
export const dispatchRawMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { materialId, quantity, notes } = req.body;

    if (!materialId || quantity === undefined) {
      res.status(400).json({ message: 'Please provide materialId and quantity' });
      return;
    }

    const material = await RawMaterial.findById(materialId);
    if (!material) {
      res.status(404).json({ message: 'Raw material item not found' });
      return;
    }

    const takeQty = Number(quantity);
    if (isNaN(takeQty) || takeQty <= 0) {
      res.status(400).json({ message: 'Please enter a valid quantity greater than 0' });
      return;
    }

    if (material.quantity < takeQty) {
      res.status(400).json({ message: `Insufficient stock! Current stock is ${material.quantity} ${material.unit}` });
      return;
    }

    // Deduct quantity
    material.quantity = Number((material.quantity - takeQty).toFixed(3));
    await material.save();

    // Create log
    const log = await InventoryLog.create({
      workerId: req.user?._id,
      workerName: req.user?.name || 'Staff',
      materialId: material._id,
      materialName: material.name,
      quantity: takeQty,
      unit: material.unit,
      notes,
    });

    res.status(201).json({ material, log });
  } catch (error) {
    console.error('DispatchRawMaterial error:', error);
    res.status(500).json({ message: 'Server error during inventory dispatch' });
  }
};

/**
 * GET /api/raw-materials/logs
 * Get all inventory dispatch logs (owner only)
 */
export const getInventoryLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await InventoryLog.find().sort({ createdAt: -1 }).limit(200);
    res.json(logs);
  } catch (error) {
    console.error('GetInventoryLogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * GET /api/raw-materials/my-logs
 * Get inventory dispatch logs for the currently logged-in worker only
 */
export const getMyInventoryLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const logs = await InventoryLog.find({ workerId: req.user?._id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (error) {
    console.error('GetMyInventoryLogs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
