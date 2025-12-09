const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');

router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.get('/check', adminController.checkAuth);
router.delete('/delete', authMiddleware, adminController.deleteAdmin);
router.get('/list', authMiddleware, adminController.getAdmins);
router.get('/test', adminController.testConnection);

module.exports = router;