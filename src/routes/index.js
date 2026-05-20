import { Router } from 'express';
import authRoutes from '../features/auth/routes/auth.routes.js';
import userRoutes from '../features/users/routes/users.routes.js';

const router = Router();

// Test health endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Feature routers mount
router.use('/auth', authRoutes);
router.use('/users', userRoutes);

export default router;
