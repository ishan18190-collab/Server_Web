const express = require('express');
const mongoose = require('mongoose');
const productRoutes = require('./routes/product.routes');
const errorHandler = require('./middleware/error-handler');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => {
  const connected = mongoose.connection.readyState === 1;
  res.status(connected ? 200 : 503).json({
    success: connected,
    message: connected ? 'Server is healthy' : 'Database unavailable',
    database: connected ? 'connected' : 'disconnected',
  });
});

app.use('/api/products', productRoutes);
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

module.exports = app;
