import { useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ExpertListPage from './pages/ExpertListPage.jsx';
import ExpertDetailPage from './pages/ExpertDetailPage.jsx';
import BookingPage from './pages/BookingPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';

const App = () => {
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const isHomePage = location.pathname === '/experts' || location.pathname === '/';

  useEffect(() => {
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <div className="app-shell">
      <header className="header">
        <h1>Expert Session Booking</h1>
        <div className="header-actions">
          {isHomePage && (
            <button className="mode-toggle" onClick={toggleTheme} type="button" aria-label="Toggle theme">
              <span className="mode-toggle-track">
                <span className="mode-toggle-orb" />
              </span>
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          )}
          <nav>
            <Link to="/experts">Experts</Link>
            <Link to="/my-bookings">My Bookings</Link>
          </nav>
        </div>
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
