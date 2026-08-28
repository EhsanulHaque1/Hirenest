// Centralized Error Handler Middleware
// This should be the last middleware in your app

const errorHandler = (err, req, res, next) => {
  // Log error (always log errors, even in production)
  console.error('❌ ERROR:', err.message);
  console.error('Stack:', err.stack);

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Determine error message
  const message = err.message || 'Internal Server Error';

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
