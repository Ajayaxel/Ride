import { Router } from 'express';
import authController from '../controller/auth.controller.js';
import { validateRegister, validateLogin } from '../validation/auth.validation.js';
import { isAuthenticated } from '../../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/refresh', authController.refresh);

// Protected routes
router.post('/logout', isAuthenticated, authController.logout);
router.get('/me', isAuthenticated, authController.getProfile);

export default router;
