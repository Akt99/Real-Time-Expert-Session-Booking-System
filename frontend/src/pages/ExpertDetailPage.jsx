import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { api } from '../api/client.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const markBooked = (slotsByDate, payload) => {
  return slotsByDate.map((entry) => {
    if (entry.date !== payload.date) return entry;

    return {
      ...entry,
      slots: entry.slots.map((slot) =>
        slot.time === payload.timeSlot ? { ...slot, isBooked: true } : slot
      )
    };
  });
};

const ExpertDetailPage = () => {
  const { id } = useParams();
  const [expert, setExpert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setExpert((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          slotsByDate: markBooked(prev.slotsByDate, payload)
        };
      });
    });

    return () => {
      socket.emit('leave_expert_room', id);
      socket.disconnect();
    };
  }, [id]);

  if (loading) return <LoadingState text="Loading expert details..." />;
  if (error) return <ErrorState message={error} />;
  if (!expert) return null;

  return (
    <section>
      <Link className="btn secondary" to="/experts">
        Back to Home
      </Link>

      <article className="card">
        <h2>{expert.name}</h2>
        <p>Category: {expert.category}</p>
        <p>Experience: {expert.experience} years</p>
        <p>Rating: {expert.rating} / 5</p>
        <p>{expert.bio}</p>
        <Link className="btn" to={`/experts/${expert._id}/book`}>
          Book a Session
        </Link>
      </article>

      <h3>Available Slots (Real-Time)</h3>
      <div className="date-groups">
        {expert.slotsByDate.map((entry) => (
          <div className="card" key={entry.date}>
            <h4>{entry.date}</h4>
            <div className="slot-list">
              {entry.slots.map((slot) => (
                <span
                  key={`${entry.date}-${slot.time}`}
                  className={`slot ${slot.isBooked ? 'booked' : 'free'}`}
                >
                  {slot.time} {slot.isBooked ? '(Booked)' : '(Available)'}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExpertDetailPage;
