import User from '../model/user.model.js';

class AuthRepository {
  /**
   * Find user by email
   * @param {string} email 
   * @param {boolean} includePassword - Set true to fetch password as well
   */
  async findByEmail(email, includePassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    if (includePassword) {
      query.select('+password');
    }
    return query.exec();
  }

  /**
   * Find user by ID
   * @param {string} id 
   */
  async findById(id) {
    return User.findById(id).exec();
  }

  /**
   * Create a new user in database
   * @param {object} userData 
   */
  async createUser(userData) {
    const user = new User(userData);
    return user.save();
  }

  /**
   * Update user refresh token (to persist sessions / handle logout)
   * @param {string} userId 
   * @param {string|null} token 
   */
  async updateRefreshToken(userId, token) {
    return User.findByIdAndUpdate(
      userId,
      { refreshToken: token },
      { new: true }
    ).select('+refreshToken').exec();
  }

  /**
   * Retrieve a user by refresh token (for verify session)
   * @param {string} token 
   */
  async findByRefreshToken(token) {
    return User.findOne({ refreshToken: token }).exec();
  }
}

export default new AuthRepository();
