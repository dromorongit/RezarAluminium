const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'GHS' },
  images: [{ type: String }],
  specs: { type: Object },
  stock: { type: Number, default: 0 },
  slug: { type: String, required: true },
  featured: { type: Boolean, default: false },
  video: [{ type: String }],
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);