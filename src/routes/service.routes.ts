import { Router } from 'express';
import * as serviceController from '../controllers/service.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.get('/', serviceController.getServicesByBusiness);
router.post('/', authMiddleware, serviceController.createService);

router.get('/:serviceId', serviceController.getService);
router.put('/:serviceId', authMiddleware, serviceController.updateService);
router.delete('/:serviceId', authMiddleware, serviceController.deleteService);

export default router;
