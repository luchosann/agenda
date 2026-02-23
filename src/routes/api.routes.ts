import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import availabilityRoutes from './availability.routes';
import * as businessController from '../controllers/business.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas o de la plataforma
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/availability', availabilityRoutes);

// Rutas para gestionar empresas a nivel de plataforma
router.get('/businesses', businessController.getAllBusinesses);
router.post('/businesses', authMiddleware, businessController.createBusiness);

export default router;
