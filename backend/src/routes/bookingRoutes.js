import { Router } from 'express';
import {
  createBooking,
  getBookingsByEmail,
  updateBookingStatus
} from '../controllers/bookingController.js';

const router = Router();

router.post('/', createBooking);
router.patch('/:id/status', updateBookingStatus);
router.get('/', getBookingsByEmail);

export default router;
