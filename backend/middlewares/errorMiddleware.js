// Middleware for handling 404 Not Found errors
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error); // Pass the error to the next error-handling middleware
};

// General error handling middleware
export const errorHandler = (err, req, res, next) => {
  // If status code is 200 (OK), it means an error was thrown but not explicitly set with a status
  // So, we default to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);

  res.json({
    message: err.message,
    // In development, send the stack trace for debugging
    // In production, don't send stack trace to clients for security
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

// export { notFound, errorHandler };
