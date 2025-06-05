// simple error helpers
const sendError = (res, status, message, error = null) => {
  const response = {
    status: 'error',
    message
  };

  // keep it simple

  res.status(status).json(response);
};

// db error helper
const handleDbError = (res, error, operation) => {
  // db error
  
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

module.exports = {
  sendError,
  handleDbError,
  handleValidationError,
  handleNotFound,
  handleAuthError,
  handleForbidden
};