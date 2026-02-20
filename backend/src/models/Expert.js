import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema(
  {
    date: { type: String, required: true },
    slots: [{ type: String, required: true }]
  },
  { _id: false }
);

const expertSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    experience: { type: Number, required: true, min: 0 },
    rating: { type: Number, required: true, min: 0, max: 5 },
    bio: { type: String, default: '' },
    availableSlots: [timeSlotSchema]
  },
  { timestamps: true }
);

expertSchema.index({ name: 1 });

export const Expert = mongoose.model('Expert', expertSchema);
