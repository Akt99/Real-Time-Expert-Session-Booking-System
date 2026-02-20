import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[0-9\s-]{7,15}$/;

const BookingPage = () => {
  const { id } = useParams();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    timeSlot: '',
    notes: ''
  });

  const selectedDateSlots = useMemo(() => {
    if (!expert || !form.date) return [];
    const item = expert.slotsByDate.find((entry) => entry.date === form.date);
    return item ? item.slots : [];
  }, [expert, form.date]);

  const setSlotBookedLocally = (payload) => {
    setExpert((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        slotsByDate: prev.slotsByDate.map((entry) => {
          if (entry.date !== payload.date) return entry;

          return {
            ...entry,
            slots: entry.slots.map((slot) =>
              slot.time === payload.timeSlot ? { ...slot, isBooked: true } : slot
            )
          };
        })
      };
    });
  };

  useEffect(() => {
    const fetchExpert = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await api.getExpertById(id);
        setExpert(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpert();
  }, [id]);

  useEffect(() => {
    const socket = io(api.getSocketUrl());
    socket.emit('join_expert_room', id);

    socket.on('slot_booked', (payload) => {
      setSlotBookedLocally(payload);
      setForm((prev) => {
        if (prev.date === payload.date && prev.timeSlot === payload.timeSlot) {
          return { ...prev, timeSlot: '' };
        }
        return prev;
      });
    });

    return () => {
      socket.emit('leave_expert_room', id);
      socket.disconnect();
    };
  }, [id]);

  const validate = () => {
    if (!form.name.trim()) return 'Name is required';
    if (!emailRegex.test(form.email)) return 'Valid email is required';
    if (!phoneRegex.test(form.phone)) return 'Valid phone number is required';
    if (!form.date) return 'Date is required';
    if (!form.timeSlot) return 'Time slot is required';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const payload = {
        expertId: id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        date: form.date,
        timeSlot: form.timeSlot,
        notes: form.notes
      };

      const data = await api.createBooking(payload);
      setSuccess(data.message || 'Booking created successfully');

      setSlotBookedLocally({ date: form.date, timeSlot: form.timeSlot });

      setForm((prev) => ({
        ...prev,
        date: '',
        timeSlot: '',
        notes: ''
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingState text="Loading booking form..." />;
  if (error && !expert) return <ErrorState message={error} />;

  return (
    <section>
      <h2>Book Session {expert ? `with ${expert.name}` : ''}</h2>

      {error && <ErrorState message={error} />}
      {success && <p className="state success">{success}</p>}

      <form className="form" onSubmit={submit}>
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            type="text"
          />
        </label>

        <label>
          Email
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type="email"
          />
        </label>

        <label>
          Phone
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            type="tel"
          />
        </label>

        <label>
          Date
          <select
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value, timeSlot: '' })}
          >
            <option value="">Select date</option>
            {expert?.slotsByDate.map((entry) => (
              <option key={entry.date} value={entry.date}>
                {entry.date}
              </option>
            ))}
          </select>
        </label>

        <label>
          Time Slot
          <select
            value={form.timeSlot}
            onChange={(e) => setForm({ ...form, timeSlot: e.target.value })}
            disabled={!form.date}
          >
            <option value="">Select time slot</option>
            {selectedDateSlots.map((slot) => (
              <option key={slot.time} value={slot.time} disabled={slot.isBooked}>
                {slot.time} {slot.isBooked ? '(Booked)' : ''}
              </option>
            ))}
          </select>
        </label>

        <label>
          Notes
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows="4"
          />
        </label>

        <button className="btn" type="submit">
          Submit Booking
        </button>
      </form>
    </section>
  );
};

export default BookingPage;
