const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// Add index for faster queries
adminSchema.index({ username: 1 });

module.exports = mongoose.model('Admin', adminSchema);