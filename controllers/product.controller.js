const Product = require('../models/product.model');

// Express 5 forwards rejected async handlers to the shared error middleware.
async function createProduct(req, res) {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, message: 'Product created successfully', data: product });
}

async function getAllProducts(req, res) {
  const products = await Product.find().sort({ createdAt: -1, _id: -1 });
  res.json({ success: true, count: products.length, data: products });
}

async function getProductById(req, res) {
  const product = await Product.findById(req.params.id);
  if (!product) return notFound(res);
  res.json({ success: true, data: product });
}

async function updateProduct(req, res) {
  const product = await Product.findByIdAndUpdate(
    req.params.id, { $set: req.body }, { returnDocument: 'after', runValidators: true },
  );
  if (!product) return notFound(res);
  res.json({ success: true, message: 'Product updated successfully', data: product });
}

async function deleteProduct(req, res) {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return notFound(res);
  res.json({ success: true, message: 'Product deleted successfully', deletedId: req.params.id });
}

function notFound(res) {
  return res.status(404).json({ success: false, message: 'Product not found' });
}

module.exports = { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct };
