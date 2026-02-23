import { Router } from 'express';
import * as workScheduleController from '../controllers/workSchedule.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authMiddleware);

router.get('/', workScheduleController.getWorkSchedulesByEmployee);
router.post('/', workScheduleController.createWorkSchedule);

router.get('/:scheduleId', workScheduleController.getWorkSchedule);
router.put('/:scheduleId', workScheduleController.updateWorkSchedule);
router.delete('/:scheduleId', workScheduleController.deleteWorkSchedule);

export default router;
