import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Expert } from '../models/Expert.js';
import { getSocket } from '../utils/socket.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateBookingInput = (payload) => {
  const required = ['expertId', 'name', 'email', 'phone', 'date', 'timeSlot'];
  const missing = required.filter((field) => !payload[field]);

  if (missing.length) {
    return `Missing required fields: ${missing.join(', ')}`;
  }

  if (!emailRegex.test(payload.email)) {
    return 'Invalid email format';
  }

  if (!/^\+?[0-9\s-]{7,15}$/.test(payload.phone)) {
    return 'Invalid phone number format';
  }

  return null;
};

export const createBooking = async (req, res) => {
  const validationError = validateBookingInput(req.body);
  if (validationError) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: validationError });
  }

  const { expertId, date, timeSlot } = req.body;

  if (!mongoose.Types.ObjectId.isValid(expertId)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid expertId' });
  }

  const expert = await Expert.findById(expertId);
  if (!expert) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Expert not found' });
  }

  const dateEntry = expert.availableSlots.find((item) => item.date === date);
  if (!dateEntry || !dateEntry.slots.includes(timeSlot)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Selected date/time slot is not available for this expert'
    });
  }

  try {
    const booking = await Booking.create({
      expertId,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      date,
      timeSlot,
      notes: req.body.notes || ''
    });

    getSocket().to(`expert:${expertId}`).emit('slot_booked', {
      expertId,
      date,
      timeSlot
    });

    res.status(StatusCodes.CREATED).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(StatusCodes.CONFLICT).json({
        message: 'This slot is already booked. Please choose another slot.'
      });
    }

    throw error;
  }
};

export const updateBookingStatus = async (req, res) => {
  const allowed = ['Pending', 'Confirmed', 'Completed'];

  if (!allowed.includes(req.body.status)) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: `Invalid status. Allowed values: ${allowed.join(', ')}`
    });
  }

  const booking = await Booking.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  if (!booking) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Booking not found' });
  }

  res.status(StatusCodes.OK).json({
    message: 'Booking status updated',
    booking
  });
};

export const getBookingsByEmail = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: 'email query param is required' });
  }

  if (!emailRegex.test(email)) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid email format' });
  }

  const bookings = await Booking.find({ email: email.toLowerCase() })
    .populate('expertId', 'name category')
    .sort({ createdAt: -1 });

  res.status(StatusCodes.OK).json({ items: bookings });
};
