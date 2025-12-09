const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Product = require('../models/Product');

const login = async (req, res) => {
  try {
    console.log('Login attempt:', req.body);
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username }).lean();
    console.log('Found admin:', admin ? 'yes' : 'no');

    if (admin) {
      const passwordMatch = await bcrypt.compare(password, admin.password);
      console.log('Password match:', passwordMatch);

      if (passwordMatch) {
        req.session.admin = true;
        req.session.adminUsername = username;
        console.log('Session set, sending success');
        res.json({ message: 'Login successful' });
      } else {
        res.status(401).json({ message: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    const existingAdmin = await Admin.findOne({ username }).lean();
    if (existingAdmin) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();

    res.json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.json({ message: 'Logout successful' });
  });
};

const checkAuth = (req, res) => {
  if (req.session.admin) {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const { username } = req.body;

    // Prevent deleting the current admin
    if (req.session.adminUsername === username) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const adminToDelete = await Admin.findOne({ username }).lean();
    if (!adminToDelete) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Check if this is the last admin
    const adminCount = await Admin.countDocuments();
    if (adminCount <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin account' });
    }

    await Admin.deleteOne({ username });
    res.json({ message: 'Admin deleted successfully' });
  } catch (error) {
    console.error('Delete admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}, { password: 0 }); // Exclude password
    res.json(admins);
  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const testConnection = async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    const productCount = await Product.countDocuments();
    res.json({
      status: 'Connected to MongoDB',
      adminCount,
      productCount,
      mongoUrl: process.env.MONGO_URL ? 'Set' : 'Not set'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Database connection failed',
      error: error.message
    });
  }
};

module.exports = {
  login,
  register,
  logout,
  checkAuth,
  deleteAdmin,
  getAdmins,
  testConnection
};