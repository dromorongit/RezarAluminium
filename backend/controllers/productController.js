const { v4: uuidv4 } = require('uuid');
const { readProducts, writeProducts } = require('./dataManager');

const getAllProducts = (req, res) => {
  const products = readProducts();
  res.json(products);
};

const getFeaturedProducts = (req, res) => {
  const products = readProducts();
  const featured = products.filter(p => p.featured);
  res.json(featured);
};

const createProduct = (req, res) => {
  const products = readProducts();
  const { name, category, description, price, featured } = req.body;

  // Generate slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Handle file uploads
  const images = req.files.images ? req.files.images.map(file => `/uploads/products/${file.filename}`) : [];
  const video = req.files.video ? `/uploads/products/${req.files.video[0].filename}` : null;
  const attachments = req.files.attachments ? req.files.attachments.map(file => `/uploads/products/${file.filename}`) : [];

  const newProduct = {
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
  };

  products.push(newProduct);
  writeProducts(products);
  res.json(newProduct);
};

const updateProduct = (req, res) => {
  const products = readProducts();
  const { id } = req.params;
  const updates = req.body;

  const productIndex = products.findIndex(p => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ message: 'Product not found' });
  }

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

  Object.assign(products[productIndex], updates);
  writeProducts(products);
  res.json(products[productIndex]);
};

const deleteProduct = (req, res) => {
  const products = readProducts();
  const { id } = req.params;

  const filteredProducts = products.filter(p => p.id !== id);
  if (filteredProducts.length === products.length) {
    return res.status(404).json({ message: 'Product not found' });
  }

  writeProducts(filteredProducts);
  res.json({ message: 'Product deleted' });
};

const getProductStats = (req, res) => {
  const products = readProducts();
  const totalProducts = products.length;
  const featuredCount = products.filter(p => p.featured).length;
  const recentUploads = products.slice(-5); // Last 5

  res.json({
    totalProducts,
    featuredCount,
    recentUploads
  });
};

module.exports = {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStats
};