// Centralized error handling utility

/**
 * Standard error response format
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @param {Object} error - Original error object (optional)
 */
const sendError = (res, status, message, error = null) => {
  const response = {
    status: 'error',
    message
  };

  // In development, include error details
  if (process.env.NODE_ENV === 'development' && error) {
    response.details = error.message || error;
  }

  res.status(status).json(response);
};

/**
 * Handle database errors
 * @param {Object} res - Express response object
 * @param {Object} error - Database error object
 * @param {string} operation - Operation being performed
 */
const handleDbError = (res, error, operation) => {
  console.error(`Database error during ${operation}:`, error);
  
  if (error.code === 'ER_DUP_ENTRY') {
    sendError(res, 409, 'Duplicate entry exists');
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    sendError(res, 400, 'Referenced resource not found');
  } else {
    sendError(res, 500, `Database error during ${operation}`);
  }
};

/**
 * Handle validation errors
 * @param {Object} res - Express response object
 * @param {string} message - Validation error message
 */
const handleValidationError = (res, message) => {
  sendError(res, 400, message);
};

/**
 * Handle not found errors
 * @param {Object} res - Express response object
 * @param {string} resource - Resource type that was not found
 */
const handleNotFound = (res, resource) => {
  sendError(res, 404, `${resource} not found`);
};

/**
 * Handle authentication errors
 * @param {Object} res - Express response object
 * @param {string} message - Auth error message
 */
const handleAuthError = (res, message = 'Authentication failed') => {
  sendError(res, 401, message);
};

/**
 * Handle authorization errors
 * @param {Object} res - Express response object
 * @param {string} message - Auth error message
 */
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