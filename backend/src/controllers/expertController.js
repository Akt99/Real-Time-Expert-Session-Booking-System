import { StatusCodes } from 'http-status-codes';
import { Expert } from '../models/Expert.js';
import { Booking } from '../models/Booking.js';

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const getExperts = async (req, res) => {
  const page = Math.max(toInt(req.query.page, 1), 1);
  const limit = Math.max(toInt(req.query.limit, 10), 1);
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }
  if (req.query.category) {
    query.category = req.query.category;
  }

  const [items, total] = await Promise.all([
    Expert.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Expert.countDocuments(query)
  ]);

  res.status(StatusCodes.OK).json({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
};

export const getExpertById = async (req, res) => {
  const expert = await Expert.findById(req.params.id);

  if (!expert) {
    return res.status(StatusCodes.NOT_FOUND).json({
      message: 'Expert not found'
    });
  }

  const bookedSlots = await Booking.find({ expertId: expert._id }).select(
    'date timeSlot -_id'
  );

  const bookedSet = new Set(bookedSlots.map((b) => `${b.date}::${b.timeSlot}`));

  const slotsByDate = expert.availableSlots.map((entry) => ({
    date: entry.date,
    slots: entry.slots.map((slot) => ({
      time: slot,
      isBooked: bookedSet.has(`${entry.date}::${slot}`)
    }))
  }));

  res.status(StatusCodes.OK).json({
    ...expert.toObject(),
    slotsByDate
  });
};
