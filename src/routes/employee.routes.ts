import { Router } from 'express';
import * as employeeController from '../controllers/employee.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import workScheduleRoutes from './workSchedule.routes';

const router = Router({ mergeParams: true });

router.get('/', employeeController.getEmployees);
router.post('/', authMiddleware, employeeController.addEmployee);
router.delete('/:employeeId', authMiddleware, employeeController.removeEmployee);

router.get('/:employeeId/services', employeeController.getEmployeeServices);
router.post('/:employeeId/services', authMiddleware, employeeController.assignService);
router.delete('/:employeeId/services/:serviceId', authMiddleware, employeeController.removeService);

router.use('/:employeeId/work-schedules', workScheduleRoutes);

export default router;
