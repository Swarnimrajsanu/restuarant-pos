import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product';

dotenv.config();

const categoryImages: Record<string, string> = {
  'Snacks': '/images/snacks.png',
  'Beverages': '/images/beverages.png',
  'Sweets': '/images/sweets.png',
  'Main Course': '/images/main_course.png',
  'Breads': '/images/breads.png',
  'Desserts': '/images/desserts.png',
  'Other': '/images/snacks.png',
};

async function migrate() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/restaurant-pos';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for image migration');

    const products = await Product.find({});
    console.log(`Found ${products.length} products to migrate.`);

    let count = 0;
    for (const product of products) {
      const defaultImg = categoryImages[product.category] || '/images/snacks.png';
      // Only set if imageUrl is not already set
      if (!product.imageUrl) {
        product.imageUrl = defaultImg;
        await product.save();
        count++;
      }
    }

    console.log(`✅ Successfully updated ${count} products with image URLs.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

migrate();
