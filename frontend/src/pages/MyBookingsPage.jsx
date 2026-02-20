import { useState } from 'react';
import { api } from '../api/client.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const MyBookingsPage = () => {
  const [email, setEmail] = useState('');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    try {
      setLoading(true);
      const data = await api.getBookingsByEmail(email.trim());
      setBookings(data.items);
    } catch (err) {
      setError(err.message);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <h2>My Bookings</h2>
      <form className="controls" onSubmit={submit}>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn" type="submit">
          Search
        </button>
      </form>

      {loading && <LoadingState text="Fetching bookings..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <div className="grid">
          {bookings.map((item) => (
            <article className="card" key={item._id}>
              <h3>{item.expertId?.name || 'Unknown Expert'}</h3>
              <p>Category: {item.expertId?.category || '-'}</p>
              <p>Date: {item.date}</p>
              <p>Time: {item.timeSlot}</p>
              <p>
                Status:{' '}
                <span className={`status-badge status-${item.status.toLowerCase()}`}>
                  {item.status}
                </span>
              </p>
              <p>Booked By: {item.name}</p>
            </article>
          ))}

          {bookings.length === 0 && <p>No bookings found for this email.</p>}
        </div>
      )}
    </section>
  );
};

export default MyBookingsPage;
