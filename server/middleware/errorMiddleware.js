export function errorMiddleware(err, req, res, next) {
  console.error(err);
  const statusCode = err.statusCode || 500;
  const payload = {
    message: statusCode === 500 ? 'Internal server error.' : err.message
  };

  if (process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}

export function notFoundMiddleware(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}
