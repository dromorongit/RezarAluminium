const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

// Configure multer for file uploads
// Use memory storage for Railway deployment (no persistent file storage)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for Railway
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/avi', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Public routes
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);

// Protected routes
router.post('/create', authMiddleware, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'attachments', maxCount: 5 }
]), productController.createProduct);

router.put('/update/:id', authMiddleware, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'video', maxCount: 1 },
  { name: 'attachments', maxCount: 5 }
]), productController.updateProduct);

router.delete('/delete/:id', authMiddleware, productController.deleteProduct);

router.get('/stats', authMiddleware, productController.getProductStats);

module.exports = router;