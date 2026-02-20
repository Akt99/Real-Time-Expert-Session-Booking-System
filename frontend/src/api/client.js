const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const parseJson = async (response) => {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
};

export const api = {
  getExperts: async ({ page = 1, limit = 6, search = '', category = '' }) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit)
    });

    if (search) params.set('search', search);
    if (category) params.set('category', category);

    const res = await fetch(`${API_BASE_URL}/experts?${params.toString()}`);
    return parseJson(res);
  },

  getExpertById: async (id) => {
    const res = await fetch(`${API_BASE_URL}/experts/${id}`);
    return parseJson(res);
  },

  createBooking: async (body) => {
    const res = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    return parseJson(res);
  },

  getBookingsByEmail: async (email) => {
    const params = new URLSearchParams({ email });
    const res = await fetch(`${API_BASE_URL}/bookings?${params.toString()}`);
    return parseJson(res);
  },

  getSocketUrl: () => API_BASE_URL
};
