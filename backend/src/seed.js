import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { Expert } from './models/Expert.js';
import { Booking } from './models/Booking.js';

dotenv.config();

const experts = [
  {
    name: 'Dr. Maya Verma',
    category: 'Career Coaching',
    experience: 10,
    rating: 4.8,
    bio: 'Helps professionals with role transitions and growth strategy.',
    availableSlots: [
      { date: '2026-02-21', slots: ['10:00 AM', '11:00 AM', '03:00 PM'] },
      { date: '2026-02-22', slots: ['09:00 AM', '01:00 PM', '04:00 PM'] }
    ]
  },
  {
    name: 'Arjun Sen',
    category: 'Software Architecture',
    experience: 12,
    rating: 4.9,
    bio: 'Specializes in scalable backend architecture and system design.',
    availableSlots: [
      { date: '2026-02-21', slots: ['09:30 AM', '12:30 PM', '05:30 PM'] },
      { date: '2026-02-23', slots: ['10:30 AM', '02:30 PM', '06:00 PM'] }
    ]
  },
  {
    name: 'Nina Dsouza',
    category: 'Product Management',
    experience: 8,
    rating: 4.7,
    bio: 'Supports PMs in roadmap, stakeholder, and execution planning.',
    availableSlots: [
      { date: '2026-02-22', slots: ['08:30 AM', '11:30 AM', '02:00 PM'] },
      { date: '2026-02-24', slots: ['09:00 AM', '12:00 PM', '03:30 PM'] }
    ]
  }
];

const runSeed = async () => {
  await connectDB();

  await Expert.deleteMany({});
  await Booking.deleteMany({});
  await Expert.insertMany(experts);

  console.log('Seed completed: experts inserted');
  process.exit(0);
};

runSeed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
