import usersService from '../service/users.service.js';
import { ApiResponse } from '../../../utils/apiResponse.js';
import { ApiError } from '../../../utils/apiResponse.js';

class UsersController {
  /**
   * Update authenticated user's profile
   */
  updateProfile = async (req, res, next) => {
    try {
      const updatedProfile = await usersService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, 200, updatedProfile, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Upload and set user avatar profile picture
   */
  uploadAvatar = async (req, res, next) => {
    try {
      if (!req.file) {
        throw ApiError.badRequest('No image file provided');
      }

      // Save localized path / filename
      const avatarPath = `/uploads/${req.file.filename}`;
      const updatedProfile = await usersService.updateAvatar(req.user.id, avatarPath);

      return ApiResponse.success(res, 200, updatedProfile, 'Avatar updated successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get all users (Admin dashboard route)
   */
  listUsers = async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '10', 10);
      const role = req.query.role;
      const search = req.query.search;

      const data = await usersService.getAllUsers({ page, limit, role, search });
      return ApiResponse.success(res, 200, data, 'Users fetched successfully');
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deactivate a user account (Admin dashboard or Self)
   */
  deactivate = async (req, res, next) => {
    try {
      const targetUserId = req.params.id || req.user.id;
      
      // Prevent standard users from deactivating others
      if (req.params.id && req.params.id !== req.user.id && req.user.role !== 'admin') {
        throw ApiError.forbidden('You do not have permission to deactivate this account');
      }

      const deactivatedProfile = await usersService.deactivateAccount(targetUserId);
      return ApiResponse.success(res, 200, deactivatedProfile, 'Account deactivated successfully');
    } catch (error) {
      next(error);
    }
  };
}

export default new UsersController();
