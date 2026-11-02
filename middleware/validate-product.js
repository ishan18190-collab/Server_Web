const mongoose = require('mongoose');

const fieldTypes = {
  name: 'string', description: 'string', price: 'number',
  category: 'string', inStock: 'boolean',
};

function validateProductBody(req, res, next) {
  const body = req.body;
  if (!body || Array.isArray(body) || typeof body !== 'object' || !Object.keys(body).length) {
    return res.status(400).json({ success: false, message: 'Provide a non-empty JSON object' });
  }

  const errors = [];
  for (const [key, value] of Object.entries(body)) {
    if (!Object.hasOwn(fieldTypes, key)) {
      errors.push('Unknown or read-only field: ' + key);
    } else if (typeof value !== fieldTypes[key] || (key === 'price' && !Number.isFinite(value))) {
      errors.push(key + ' must be a valid ' + fieldTypes[key]);
    }
  }

  if (errors.length) {
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }
  next();
}

function validateProductId(req, res, next) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid product ID format' });
  }
  next();
}

module.exports = { validateProductBody, validateProductId };
