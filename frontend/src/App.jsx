import { Link, Navigate, Route, Routes } from 'react-router-dom';
import ExpertListPage from './pages/ExpertListPage.jsx';
import ExpertDetailPage from './pages/ExpertDetailPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';

const App = () => {
  return (
    <div className="app-shell">
      <header className="header">
        <h1>Expert Session Booking</h1>
        <nav>
          <Link to="/experts">Experts</Link>
          <Link to="/my-bookings">My Bookings</Link>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/experts" replace />} />
          <Route path="/experts" element={<ExpertListPage />} />
          <Route path="/experts/:id" element={<ExpertDetailPage />} />
          <Route path="/experts/:id/book" element={<BookingPage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
