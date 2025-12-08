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
    const { name, category, description, price, featured } = req.body;

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Handle file uploads
    const images = req.files.images ? req.files.images.map(file => `/uploads/products/${file.filename}`) : [];
    const video = req.files.video ? `/uploads/products/${req.files.video[0].filename}` : null;
    const attachments = req.files.attachments ? req.files.attachments.map(file => `/uploads/products/${file.filename}`) : [];

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
      video: video ? [video] : [],
      attachments
    });

    await newProduct.save();
    res.json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Handle file uploads if any
    if (req.files) {
      if (req.files.images) {
        updates.images = req.files.images.map(file => `/uploads/products/${file.filename}`);
      }
      if (req.files.video) {
        updates.video = [`/uploads/products/${req.files.video[0].filename}`];
      }
      if (req.files.attachments) {
        updates.attachments = req.files.attachments.map(file => `/uploads/products/${file.filename}`);
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