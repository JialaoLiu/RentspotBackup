// Error handlers evolved from basic res.status().json() calls scattered everywhere
// Centralized error handling makes debugging easier and responses consistent

const sendError = (res, status, message, error = null) => {
  const response = {
    status: 'error',
    message
  };

  // if (error && process.env.NODE_ENV === 'development') {
  //   response.details = error.message;
  // }

  res.status(status).json(response);
};

// db error helper
const handleDbError = (res, error, operation) => {
  // console.error(`Database error during ${operation}:`, error);
  // res.status(500).json({ message: 'Internal server error' });
  
  sendError(res, 500, 'Database error');
};

// validation error
const handleValidationError = (res, message) => {
  sendError(res, 400, message);
};

// not found error
const handleNotFound = (res, resource) => {
  sendError(res, 404, `${resource} not found`);
};

// auth error
const handleAuthError = (res, message = 'Authentication failed') => {
  sendError(res, 401, message);
};

// forbidden error
const handleForbidden = (res, message = 'Access denied') => {
  sendError(res, 403, message);
};

// TODO: add rate limiting error handler
// TODO: add file upload error handler

module.exports = {
  sendError,
  handleDbError,
  handleValidationError,
  handleNotFound,
  handleAuthError,
  handleForbidden
};