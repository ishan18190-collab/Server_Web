function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Malformed JSON request body' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body exceeds the 100 KB limit' });
  }
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(error.errors).map((item) => item.message),
    });
  }
  if (error.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid field value' });
  }

  // Avoid exposing database credentials or stack traces in HTTP responses.
  console.error('Request failed:', error.name);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = errorHandler;
