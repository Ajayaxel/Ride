import User from '../model/user.model.js';

class UsersRepository {
  /**
   * Find user by ID
   */
  async findById(id) {
    return User.findById(id).exec();
  }

  /**
   * Update user details
   */
  async update(id, updateData) {
    return User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).exec();
  }

  /**
   * List all users with pagination and search
   */
  async findAll({ page = 1, limit = 10, role, search }) {
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skipIndex = (page - 1) * limit;
    
    const users = await User.find(query)
      .skip(skipIndex)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    const total = await User.countDocuments(query);

    return {
      users,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Delete or deactivate user
   */
  async deactivate(id) {
    return User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).exec();
  }
}

export default new UsersRepository();
