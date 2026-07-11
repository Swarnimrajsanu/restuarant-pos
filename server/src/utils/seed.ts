import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Product from '../models/Product';

dotenv.config();

/**
 * Seed Script — Creates default owner, worker, and sample products
 * Run with: npm run seed
 */
const seedData = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-pos';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing users and products');

    // Create Owner
    const owner = await User.create({
      name: 'Restaurant Owner',
      email: 'owner@restaurant.com',
      password: 'password123',
      role: 'owner',
    });
    console.log(`👤 Owner created: ${owner.email}`);

    // Create Worker
    const worker = await User.create({
      name: 'Rahul Kumar',
      email: 'rahul@restaurant.com',
      password: 'password123',
      role: 'worker',
    });
    console.log(`👤 Worker created: ${worker.email}`);

    // Create Sample Products
    const products = [
      // Snacks
      { name: 'Samosa', category: 'Snacks', price: 15, available: true },
      { name: 'Kachori', category: 'Snacks', price: 20, available: true },
      { name: 'Pani Puri', category: 'Snacks', price: 30, available: true },
      { name: 'Vada Pav', category: 'Snacks', price: 20, available: true },
      { name: 'Aloo Tikki', category: 'Snacks', price: 25, available: true },
      { name: 'Bread Pakora', category: 'Snacks', price: 20, available: true },
      { name: 'Dahi Bhalla', category: 'Snacks', price: 40, available: true },

      // Beverages
      { name: 'Masala Chai', category: 'Beverages', price: 15, available: true },
      { name: 'Coffee', category: 'Beverages', price: 25, available: true },
      { name: 'Lassi', category: 'Beverages', price: 40, available: true },
      { name: 'Fresh Lime Soda', category: 'Beverages', price: 35, available: true },
      { name: 'Mango Shake', category: 'Beverages', price: 50, available: true },
      { name: 'Buttermilk', category: 'Beverages', price: 20, available: true },
      { name: 'Green Tea', category: 'Beverages', price: 20, available: true },

      // Sweets
      { name: 'Gulab Jamun (2 pcs)', category: 'Sweets', price: 40, available: true },
      { name: 'Rasgulla (2 pcs)', category: 'Sweets', price: 40, available: true },
      { name: 'Jalebi (100g)', category: 'Sweets', price: 50, available: true },
      { name: 'Barfi (100g)', category: 'Sweets', price: 60, available: true },
      { name: 'Ladoo (2 pcs)', category: 'Sweets', price: 40, available: true },

      // Main Course
      { name: 'Chole Bhature', category: 'Main Course', price: 80, available: true },
      { name: 'Pav Bhaji', category: 'Main Course', price: 70, available: true },
      { name: 'Rajma Chawal', category: 'Main Course', price: 90, available: true },
      { name: 'Dal Makhani + Rice', category: 'Main Course', price: 100, available: true },
      { name: 'Paneer Butter Masala', category: 'Main Course', price: 120, available: true },
      { name: 'Thali (Veg)', category: 'Main Course', price: 150, available: true },

      // Breads
      { name: 'Roti', category: 'Breads', price: 10, available: true },
      { name: 'Naan', category: 'Breads', price: 25, available: true },
      { name: 'Butter Naan', category: 'Breads', price: 35, available: true },
      { name: 'Garlic Naan', category: 'Breads', price: 40, available: true },
      { name: 'Paratha', category: 'Breads', price: 30, available: true },

      // Desserts
      { name: 'Kulfi', category: 'Desserts', price: 40, available: true },
      { name: 'Rabri', category: 'Desserts', price: 50, available: true },
      { name: 'Kheer', category: 'Desserts', price: 45, available: true },
    ];

    const categoryImages: Record<string, string> = {
      'Snacks': '/images/snacks.png',
      'Beverages': '/images/beverages.png',
      'Sweets': '/images/sweets.png',
      'Main Course': '/images/main_course.png',
      'Breads': '/images/breads.png',
      'Desserts': '/images/desserts.png',
    };

    const productsWithImages = products.map((p) => ({
      ...p,
      imageUrl: categoryImages[p.category] || '/images/snacks.png',
    }));

    await Product.insertMany(productsWithImages);
    console.log(`🍛 ${products.length} products created with default images`);

    console.log('\n✅ Seed complete!');
    console.log('─────────────────────────────────────');
    console.log('Owner Login:  owner@restaurant.com / password123');
    console.log('Worker Login: rahul@restaurant.com / password123');
    console.log('─────────────────────────────────────');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
