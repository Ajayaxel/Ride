import { Router } from 'express';
import usersController from '../controller/users.controller.js';
import { validateUpdateProfile } from '../validation/users.validation.js';
import { isAuthenticated, authorizeRoles } from '../../../middleware/auth.middleware.js';
import { upload } from '../../../middleware/upload.middleware.js';

const router = Router();

// Protect all routes in this router
router.use(isAuthenticated);

// User-specific self profile management
router.put('/profile', validateUpdateProfile, usersController.updateProfile);
router.post('/avatar', upload.single('avatar'), usersController.uploadAvatar);
router.patch('/deactivate', usersController.deactivate);

// Admin-specific user directory management
router.get('/', authorizeRoles('admin'), usersController.listUsers);
router.patch('/deactivate/:id', authorizeRoles('admin'), usersController.deactivate);

export default router;
