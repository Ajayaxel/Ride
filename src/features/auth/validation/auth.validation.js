import { ApiError } from '../../../utils/apiResponse.js';

export const validateRegister = (req, res, next) => {
  const { name, email, password, phoneNumber, role } = req.body;
  const errors = [];

  if (!name || name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      errors.push({ field: 'email', message: 'Email is invalid' });
    }
  }

  if (!password || password.length < 6) {
    errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
  }

  if (role && !['user', 'driver', 'admin'].includes(role)) {
    errors.push({ field: 'role', message: 'Invalid role. Choose from: user, driver, admin' });
  }

  if (phoneNumber) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      errors.push({ field: 'phoneNumber', message: 'Phone number format is invalid' });
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Failed', errors));
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim() === '') {
    errors.push({ field: 'email', message: 'Email is required' });
  }

  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Failed', errors));
  }

  next();
};
