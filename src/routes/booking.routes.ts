import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';

const router = Router();

router.post('/', bookingController.createBooking);
router.get('/', bookingController.getAllBookings);
router.get('/:id', bookingController.getBooking);

export default router;
