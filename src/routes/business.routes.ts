import { Router } from 'express';
import * as businessController from '../controllers/business.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import serviceRoutes from './service.routes';
import employeeRoutes from './employee.routes';
import dashboardRoutes from './dashboard.routes';
import bookingRoutes from './booking.routes';

// Usamos mergeParams para asegurarnos de que los parámetros de routers anidados se pasen correctamente
const router = Router({ mergeParams: true });

// Ruta para obtener los datos de la empresa actual (identificada por el subdominio)
router.get('/', businessController.getBusiness);

// Rutas para actualizar y eliminar la empresa actual
router.put('/', authMiddleware, businessController.updateBusiness);
router.delete('/', authMiddleware, businessController.deleteBusiness);

// Rutas anidadas para los recursos de la empresa
router.use('/services', serviceRoutes);
router.use('/employees', employeeRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/bookings', bookingRoutes);

export default router;
