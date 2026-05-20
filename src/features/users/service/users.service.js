import usersRepository from '../repository/users.repository.js';
import { UserDto } from '../../auth/dto/auth.dto.js';
import { ApiError } from '../../../utils/apiResponse.js';
import logger from '../../../utils/logger.js';

class UsersService {
  /**
   * Update user profile settings
   */
  async updateProfile(userId, updateData) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    // Limit fields that can be updated via profile endpoint
    const safeUpdates = {};
    if (updateData.name !== undefined) safeUpdates.name = updateData.name;
    if (updateData.phoneNumber !== undefined) safeUpdates.phoneNumber = updateData.phoneNumber;

    const updatedUser = await usersRepository.update(userId, safeUpdates);
    logger.success(`User profile updated for: ${updatedUser.email}`);
    
    return UserDto.fromUser(updatedUser);
  }

  /**
   * Update user avatar image path
   */
  async updateAvatar(userId, avatarPath) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const updatedUser = await usersRepository.update(userId, { avatar: avatarPath });
    logger.success(`User avatar updated for: ${updatedUser.email}`);
    
    return UserDto.fromUser(updatedUser);
  }

  /**
   * Retrieve all users (Admin view)
   */
  async getAllUsers(options) {
    const { users, total, page, pages } = await usersRepository.findAll(options);
    
    return {
      users: UserDto.fromUserList(users),
      total,
      page,
      pages,
    };
  }

  /**
   * Deactivate a user account (Admin function or Self action)
   */
  async deactivateAccount(userId) {
    const user = await usersRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const deactivatedUser = await usersRepository.deactivate(userId);
    logger.success(`User account deactivated: ${deactivatedUser.email}`);
    
    return UserDto.fromUser(deactivatedUser);
  }
}

export default new UsersService();
