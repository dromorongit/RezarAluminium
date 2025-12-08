const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('./models/Product');
const Admin = require('./models/Admin');
const bcrypt = require('bcryptjs');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:mVQnmCFeuQbLrziRFAOyYMvztBVSItqY@mongodb.railway.internal:27017';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');

    // Seed admin
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const admin = new Admin({ username: 'admin', password: hashedPassword });
      await admin.save();
      console.log('Default admin created');
    }

    // Seed products
    const productsPath = path.join(__dirname, '../data/products.json');
    if (fs.existsSync(productsPath)) {
      const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
      const existingProducts = await Product.countDocuments();
      if (existingProducts === 0) {
        const products = productsData.map(p => ({
          id: p.id,
          name: p.name,
          category: p.category,
          shortDescription: p.short_description || p.description,
          longDescription: '',
          price: p.price,
          currency: p.currency,
          images: p.images,
          additionalImages: [],
          specs: p.specs,
          stock: p.stock,
          slug: p.slug,
          featured: false,
          video: [],
          attachments: []
        }));
        await Product.insertMany(products);
        console.log('Products seeded');
      }
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();