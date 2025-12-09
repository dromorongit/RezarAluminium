const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');

// Function to convert image to base64 data URL
function bufferToDataURL(buffer, mimetype) {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}

const getAllProducts = async (req, res) => {
  try {
    console.log('GET /api/products - Fetching all products');
    console.log('GET /api/products - Database query starting...');

    const products = await Product.find();
    console.log(`GET /api/products - Database query completed. Found ${products.length} products`);

    if (products.length === 0) {
      console.warn('GET /api/products - WARNING: No products found in database');
      console.log('GET /api/products - Check if products have been added via admin interface');
    } else {
      console.log('GET /api/products - Sample product:', {
        id: products[0].id,
        name: products[0].name,
        featured: products[0].featured,
        category: products[0].category
      });
    }

    res.json(products);
  } catch (error) {
    console.error('GET /api/products - ERROR: Database query failed:', error);
    console.error('GET /api/products - ERROR details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    console.log('GET /api/products/featured - Fetching featured products');
    console.log('GET /api/products/featured - Database query starting...');

    const featured = await Product.find({ featured: true });
    console.log(`GET /api/products/featured - Database query completed. Found ${featured.length} featured products`);

    if (featured.length === 0) {
      console.warn('GET /api/products/featured - WARNING: No featured products found in database');
      console.log('GET /api/products/featured - Check if any products are marked as featured in admin');
    } else {
      console.log('GET /api/products/featured - Sample featured product:', {
        id: featured[0].id,
        name: featured[0].name,
        category: featured[0].category
      });
    }

    res.json(featured);
  } catch (error) {
    console.error('GET /api/products/featured - ERROR: Database query failed:', error);
    console.error('GET /api/products/featured - ERROR details:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log('POST /api/products/create - Creating product');
    console.log('Product data:', req.body);
    console.log('Uploaded files:', req.files ? Object.keys(req.files) : 'No files');

    const { name, category, shortDescription, longDescription, featured } = req.body;

    if (!name || !category || !shortDescription) {
      console.error('Missing required fields');
      return res.status(400).json({ message: 'Missing required fields: name, category, shortDescription' });
    }

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    console.log('Generated slug:', slug);

    // Handle file uploads
    let images = [];
    let additionalImages = [];
    let video = [];

    if (req.files) {
      console.log('Processing file uploads...');

      // Main product images
      if (req.files.images && req.files.images.length > 0) {
        images = req.files.images.map(file => bufferToDataURL(file.buffer, file.mimetype));
        console.log(`Processed ${images.length} main images`);
      }

      // Additional project/product images (from attachments field)
      if (req.files.attachments && req.files.attachments.length > 0) {
        additionalImages = req.files.attachments.map(file => bufferToDataURL(file.buffer, file.mimetype));
        console.log(`Processed ${additionalImages.length} additional images`);
      }

      // Video
      if (req.files.video && req.files.video.length > 0) {
        const videoFile = req.files.video[0];
        if (videoFile.mimetype.startsWith('image/')) {
          video = [bufferToDataURL(videoFile.buffer, videoFile.mimetype)];
        } else {
          video = ['/assets/products/placeholder-video.mp4'];
        }
        console.log('Processed video:', video.length > 0 ? 'yes' : 'no');
      }
    } else {
      console.log('No files uploaded');
    }

    const newProduct = new Product({
      id: `rezar-${uuidv4().slice(0, 8)}`,
      name,
      category,
      shortDescription,
      longDescription: longDescription || '',
      price: 0,
      currency: 'GHS',
      images,
      additionalImages,
      specs: {}, // Can be extended
      stock: 0, // Default
      slug,
      featured: featured === 'true',
      video,
      attachments: [] // Keep empty for potential future use
    });

    console.log('Saving new product to database...');
    await newProduct.save();
    console.log('Product saved successfully:', {
      id: newProduct.id,
      name: newProduct.name,
      featured: newProduct.featured
    });

    res.json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle file uploads if any
    if (req.files) {
      if (req.files.images && req.files.images.length > 0) {
        updates.images = req.files.images.map(file => bufferToDataURL(file.buffer, file.mimetype));
      }

      if (req.files.attachments && req.files.attachments.length > 0) {
        updates.additionalImages = req.files.attachments.map(file => bufferToDataURL(file.buffer, file.mimetype));
      }

      if (req.files.video && req.files.video.length > 0) {
        const videoFile = req.files.video[0];
        if (videoFile.mimetype.startsWith('image/')) {
          updates.video = [bufferToDataURL(videoFile.buffer, videoFile.mimetype)];
        } else {
          updates.video = ['/assets/products/placeholder-video.mp4'];
        }
      }
    }

    // Price is no longer updated from form, keep default 0
    if (updates.featured !== undefined) updates.featured = updates.featured === 'true';

    const product = await Product.findOneAndUpdate({ id }, updates, { new: true });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOneAndDelete({ id });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const featuredCount = await Product.countDocuments({ featured: true });
    const recentUploads = await Product.find().sort({ createdAt: -1 }).limit(5);

    res.json({
      totalProducts,
      featuredCount,
      recentUploads
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
};