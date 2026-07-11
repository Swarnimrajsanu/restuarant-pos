import { Request, Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/products
 * List all products. Workers see only available products.
 */
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, category } = req.query;
    const filter: any = {};

    // Workers only see available products
    if (req.user?.role === 'worker') {
      filter.available = true;
    }

    // Category filter
    if (category && category !== 'all') {
      filter.category = category;
    }

    // Search by name
    if (search) {
      filter.name = { $regex: search as string, $options: 'i' };
    }

    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json(products);
  } catch (error) {
    console.error('GetProducts error:', error);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

/**
 * POST /api/products
 * Create a new product (owner only)
 */
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, price, imageUrl, available } = req.body;

    if (!name || !category || price === undefined) {
      res.status(400).json({ message: 'Name, category, and price are required' });
      return;
    }

    const product = await Product.create({ name, category, price, imageUrl, available });
    res.status(201).json(product);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ message: messages.join(', ') });
      return;
    }
    console.error('CreateProduct error:', error);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

/**
 * PUT /api/products/:id
 * Update a product (owner only)
 */
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, price, imageUrl, available } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, price, imageUrl, available },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e: any) => e.message);
      res.status(400).json({ message: messages.join(', ') });
      return;
    }
    console.error('UpdateProduct error:', error);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

/**
 * DELETE /api/products/:id
 * Delete a product (owner only)
 */
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

/**
 * PATCH /api/products/:id/toggle
 * Toggle product availability (owner only)
 */
export const toggleProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    product.available = !product.available;
    await product.save();
    res.json(product);
  } catch (error) {
    console.error('ToggleProduct error:', error);
    res.status(500).json({ message: 'Server error toggling product' });
  }
};
