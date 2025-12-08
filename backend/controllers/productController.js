const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const featured = await Product.find({ featured: true });
    res.json(featured);
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createProduct = async (req, res) => {
  try {
    console.log('Creating product:', req.body);
    console.log('Files:', req.files);
    const { name, category, description, price, featured } = req.body;

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Handle file uploads (placeholder URLs for Railway - files not persisted)
    let images = [];
    let video = [];
    let attachments = [];

    // For Railway deployment, we'll use placeholder URLs since files aren't persisted
    // In production, you'd integrate with cloud storage like Cloudinary or AWS S3
    if (req.files) {
      if (req.files.images) {
        images = req.files.images.map((file, index) => `/assets/products/placeholder-image-${index + 1}.jpg`);
      }
      if (req.files.video) {
        video = ['/assets/products/placeholder-video.mp4'];
      }
      if (req.files.attachments) {
        attachments = req.files.attachments.map((file, index) => `/assets/products/placeholder-doc-${index + 1}.pdf`);
      }
    }

    const newProduct = new Product({
      id: `rezar-${uuidv4().slice(0, 8)}`,
      name,
      category,
      description,
      price: parseFloat(price),
      currency: 'GHS',
      images,
      specs: {}, // Can be extended
      stock: 0, // Default
      slug,
      featured: featured === 'true',
      video,
      attachments
    });

    await newProduct.save();
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

    // Handle file uploads if any (placeholder URLs for Railway)
    if (req.files) {
      if (req.files.images) {
        updates.images = req.files.images.map((file, index) => `/assets/products/placeholder-image-${index + 1}.jpg`);
      }
      if (req.files.video) {
        updates.video = ['/assets/products/placeholder-video.mp4'];
      }
      if (req.files.attachments) {
        updates.attachments = req.files.attachments.map((file, index) => `/assets/products/placeholder-doc-${index + 1}.pdf`);
      }
    }

    if (updates.price) updates.price = parseFloat(updates.price);
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