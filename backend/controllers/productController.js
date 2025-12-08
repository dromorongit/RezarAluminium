const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');

// Function to convert image to base64 data URL
function bufferToDataURL(buffer, mimetype) {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
}

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
    const { name, category, shortDescription, longDescription, price, featured } = req.body;

    // Generate slug
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Handle file uploads
    let images = [];
    let additionalImages = [];
    let video = [];

    if (req.files) {
      // Main product images
      if (req.files.images && req.files.images.length > 0) {
        images = req.files.images.map(file => bufferToDataURL(file.buffer, file.mimetype));
      }

      // Additional project/product images (from attachments field)
      if (req.files.attachments && req.files.attachments.length > 0) {
        additionalImages = req.files.attachments.map(file => bufferToDataURL(file.buffer, file.mimetype));
      }

      // Video
      if (req.files.video && req.files.video.length > 0) {
        const videoFile = req.files.video[0];
        if (videoFile.mimetype.startsWith('image/')) {
          video = [bufferToDataURL(videoFile.buffer, videoFile.mimetype)];
        } else {
          video = ['/assets/products/placeholder-video.mp4'];
        }
      }
    }

    const newProduct = new Product({
      id: `rezar-${uuidv4().slice(0, 8)}`,
      name,
      category,
      shortDescription,
      longDescription: longDescription || '',
      price: parseFloat(price),
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