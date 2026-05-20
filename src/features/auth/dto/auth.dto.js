/**
 * Data Transfer Object for User responses
 */
export class UserDto {
  constructor(user) {
    this.id = user._id || user.id;
    this.name = user.name;
    this.email = user.email;
    this.phoneNumber = user.phoneNumber || '';
    this.role = user.role;
    this.avatar = user.avatar || '';
    this.isActive = user.isActive;
    this.createdAt = user.createdAt;
  }

  static fromUser(user) {
    if (!user) return null;
    return new UserDto(user);
  }

  static fromUserList(users) {
    if (!users || !Array.isArray(users)) return [];
    return users.map((user) => new UserDto(user));
  }
}

/**
 * Data Transfer Object for authentication success payload
 */
export class AuthResponseDto {
  constructor(user, accessToken) {
    this.user = UserDto.fromUser(user);
    this.accessToken = accessToken;
  }
}
