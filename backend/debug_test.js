const mongoose = require('mongoose');
const Product = require('./models/Product');

// Connect to MongoDB
const MONGO_URL = process.env.MONGO_URL || 'mongodb://mongo:mVQnmCFeuQbLrziRFAOyYMvztBVSItqY@mongodb.railway.internal:27017';

async function runDiagnostics() {
  try {
    console.log('=== REZAR ALUMINIUM DEBUG DIAGNOSTICS ===\n');

    // Test 1: Database Connection
    console.log('1. Testing database connection...');
    await mongoose.connect(MONGO_URL);
    console.log('✅ Database connection successful\n');

    // Test 2: Check total products
    console.log('2. Checking total products in database...');
    const totalProducts = await Product.countDocuments();
    console.log(`📊 Total products found: ${totalProducts}\n`);

    // Test 3: Check featured products
    console.log('3. Checking featured products...');
    const featuredProducts = await Product.find({ featured: true });
    console.log(`⭐ Featured products found: ${featuredProducts.length}`);
    if (featuredProducts.length > 0) {
      console.log('Featured products:');
      featuredProducts.forEach(p => console.log(`  - ${p.name} (ID: ${p.id})`));
    }
    console.log('');

    // Test 4: Check recently added products
    console.log('4. Checking recently added products (last 5)...');
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(5);
    console.log(`📅 Recent products found: ${recentProducts.length}`);
    if (recentProducts.length > 0) {
      console.log('Recent products:');
      recentProducts.forEach(p => {
        console.log(`  - ${p.name} (ID: ${p.id})`);
        console.log(`    Featured: ${p.featured}`);
        console.log(`    Created: ${p.createdAt}`);
        console.log(`    Images: ${p.images.length}`);
      });
    }
    console.log('');

    // Test 5: Check for products with missing required fields
    console.log('5. Checking for products with potential issues...');
    const allProducts = await Product.find();
    const problematicProducts = allProducts.filter(p => {
      return !p.name || !p.category || !p.shortDescription || p.images.length === 0;
    });
    console.log(`⚠️  Products with potential issues: ${problematicProducts.length}`);
    if (problematicProducts.length > 0) {
      problematicProducts.forEach(p => {
        console.log(`  - Product ID: ${p.id}`);
        console.log(`    Missing name: ${!p.name}`);
        console.log(`    Missing category: ${!p.category}`);
        console.log(`    Missing shortDescription: ${!p.shortDescription}`);
        console.log(`    No images: ${p.images.length === 0}`);
      });
    }
    console.log('');

    console.log('=== DIAGNOSTICS COMPLETE ===');
    console.log('\nRECOMMENDATIONS:');
    console.log('1. If no products found, check MongoDB connection');
    console.log('2. If no featured products, mark some products as featured');
    console.log('3. If products exist but not showing, check API endpoints');
    console.log('4. Check browser console for CORS errors');

  } catch (error) {
    console.error('❌ Diagnostic error:', error.message);
    console.log('\nTROUBLESHOOTING TIPS:');
    console.log('1. Check if MongoDB is running');
    console.log('2. Verify MongoDB connection URL');
    console.log('3. Check if backend server is running');
    console.log('4. Test with local MongoDB first');
  } finally {
    await mongoose.disconnect();
    console.log('\nDatabase connection closed.');
  }
}

runDiagnostics();