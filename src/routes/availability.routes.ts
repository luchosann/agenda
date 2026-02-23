import { Router } from 'express';
import * as availabilityController from '../controllers/availability.controller';

const router = Router();

router.get('/', availabilityController.getAvailability);

export default router;
