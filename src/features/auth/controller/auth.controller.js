import authService from '../service/auth.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import env from '../../../config/env.js';

// Cookie options for secure token delivery
const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days matching refresh token duration
};

class AuthController {
  /**
   * Register a user
   */
  register = async (req, res, next) => {
    try {
      const user = await authService.register(req.body);
      return ApiResponse.created(res, user, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Log in a user
   */
  login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const { user, accessToken, refreshToken } = await authService.login(email, password);

      // Store refresh token securely in cookies
      res.cookie('refreshToken', refreshToken, cookieOptions);

      return ApiResponse.success(
        res,
        200,
        { user, accessToken },
        'Logged in successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Log out a user
   */
  logout = async (req, res, next) => {
    try {
      // Clear refresh token from database if authenticated
      if (req.user) {
        await authService.logout(req.user.id);
      }

      // Clear the cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: env.nodeEnv === 'production',
        sameSite: env.nodeEnv === 'production' ? 'none' : 'lax',
      });

      return ApiResponse.success(res, 200, null, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh session tokens
   */
  refresh = async (req, res, next) => {
    try {
      // Read refresh token from either cookies or post body
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      const { accessToken, refreshToken: newRefreshToken, user } = 
        await authService.refreshSession(refreshToken);

      // Re-establish secure cookie
      res.cookie('refreshToken', newRefreshToken, cookieOptions);

      return ApiResponse.success(
        res,
        200,
        { user, accessToken },
        'Session tokens refreshed successfully'
      );
    } catch (error) {
      next(error);
    }
  };

  /**
   * Retrieve current authenticated user profile
   */
  getProfile = async (req, res, next) => {
    try {
      const profile = await authService.getProfile(req.user.id);
      return ApiResponse.success(res, 200, profile, 'User profile fetched successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();
