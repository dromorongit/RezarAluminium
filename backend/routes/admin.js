const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.post('/register', adminController.register);
router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.get('/check', adminController.checkAuth);
router.get('/test', adminController.testConnection);

module.exports = router;