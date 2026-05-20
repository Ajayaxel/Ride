import authRepository from '../repository/auth.repository.js';
import { ApiError } from '../../../utils/apiResponse.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../../utils/token.js';
import { UserDto, AuthResponseDto } from '../dto/auth.dto.js';
import logger from '../../../utils/logger.js';

class AuthService {
  /**
   * Register a new user
   */
  async register(userData) {
    const existingUser = await authRepository.findByEmail(userData.email);
    if (existingUser) {
      throw ApiError.badRequest('A user with this email address already exists');
    }

    const newUser = await authRepository.createUser(userData);
    logger.success(`User registered successfully: ${newUser.email}`);
    return UserDto.fromUser(newUser);
  }

  /**
   * Log in user
   */
  async login(email, password) {
    // Find user with password selected
    const user = await authRepository.findByEmail(email, true);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      throw ApiError.forbidden('Your account is deactivated. Contact an administrator.');
    }

    // Compare passwords
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Generate tokens
    const tokenPayload = { id: user._id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token to user record
    await authRepository.updateRefreshToken(user._id, refreshToken);

    logger.success(`User logged in successfully: ${user.email}`);

    // Return structured auth DTO
    return {
      user: UserDto.fromUser(user),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Log out user
   */
  async logout(userId) {
    await authRepository.updateRefreshToken(userId, null);
    logger.info(`User logged out successfully: ${userId}`);
    return true;
  }

  /**
   * Refresh JWT tokens using valid Refresh Token
   */
  async refreshSession(token) {
    if (!token) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    try {
      // 1. Verify token authenticity
      const decoded = verifyRefreshToken(token);

      // 2. Query user & match against stored token
      const user = await authRepository.findById(decoded.id);
      
      // Fetch full DB record with selected token to verify match
      const userWithToken = await authRepository.findByRefreshToken(token);
      
      if (!user || !userWithToken || user._id.toString() !== userWithToken._id.toString()) {
        throw ApiError.unauthorized('Invalid session. Please login again.');
      }

      if (!user.isActive) {
        throw ApiError.forbidden('Your account is deactivated. Contact an administrator.');
      }

      // 3. Generate new token pair
      const tokenPayload = { id: user._id, email: user.email, role: user.role };
      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      // 4. Update stored refresh token
      await authRepository.updateRefreshToken(user._id, newRefreshToken);

      logger.info(`Session successfully refreshed for user: ${user.email}`);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: UserDto.fromUser(user),
      };
    } catch (error) {
      logger.debug(`Session refresh failed: ${error.message}`);
      throw ApiError.unauthorized('Session expired or invalid. Please login again.');
    }
  }

  /**
   * Get user profile details
   */
  async getProfile(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User profile not found');
    }
    return UserDto.fromUser(user);
  }
}

export default new AuthService();
