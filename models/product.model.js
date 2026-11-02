const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String, required: [true, 'Product name is required'], trim: true,
    minlength: [2, 'Name must contain at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters'],
  },
  description: {
    type: String, required: [true, 'Product description is required'], trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  price: {
    type: Number, required: [true, 'Product price is required'],
    min: [0, 'Price must be zero or greater'],
    validate: { validator: Number.isFinite, message: 'Price must be finite' },
  },
  category: {
    type: String, required: [true, 'Product category is required'],
    trim: true, default: 'General',
  },
  inStock: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
