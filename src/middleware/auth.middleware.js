import { ApiError } from '../utils/apiResponse.js';
import { verifyAccessToken } from '../utils/token.js';
import logger from '../utils/logger.js';

export const isAuthenticated = async (req, res, next) => {
  try {
    let token = null;

    // Check authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Check cookies
    else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      throw ApiError.unauthorized('Authentication token is required');
    }

    try {
      const decoded = verifyAccessToken(token);
      
      // Attach user details to request object
      req.user = {
        id: decoded.id || decoded._id,
        email: decoded.email,
        role: decoded.role || 'user',
      };
      
      next();
    } catch (jwtError) {
      logger.debug(`JWT verification failed: ${jwtError.message}`);
      throw ApiError.unauthorized('Invalid or expired authentication token');
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Role authorization guard
 * @param  {...string} roles - Permitted roles
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User context is missing'));
    }
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Role '${req.user.role}' is not authorized to access this resource`));
    }
    next();
  };
};
