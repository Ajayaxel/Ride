import { ApiError } from '../../../utils/apiResponse.js';

export const validateUpdateProfile = (req, res, next) => {
  const { name, phoneNumber } = req.body;
  const errors = [];

  if (name !== undefined && name.trim() === '') {
    errors.push({ field: 'name', message: 'Name cannot be empty' });
  }

  if (phoneNumber !== undefined) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (phoneNumber.trim() !== '' && !phoneRegex.test(phoneNumber)) {
      errors.push({ field: 'phoneNumber', message: 'Phone number format is invalid' });
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Failed', errors));
  }

  next();
};
