import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import LoadingState from '../components/LoadingState.jsx';
import ErrorState from '../components/ErrorState.jsx';

const LIMIT = 6;

const ExpertListPage = () => {
  const [experts, setExperts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = useMemo(() => {
    const unique = new Set(experts.map((e) => e.category));
    return ['All', ...unique];
  }, [experts]);

  const fetchExperts = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getExperts({
        page,
        limit: LIMIT,
        search,
        category: category === 'All' ? '' : category
      });
      setExperts(data.items);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts(1);
  }, [search, category]);

  return (
    <section>
      <div className="controls">
        <input
          type="text"
          value={search}
          placeholder="Search expert by name"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories
            .filter((item) => item !== 'All')
            .map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </select>
      </div>

      {loading && <LoadingState text="Loading experts..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <>
          <div className="grid">
            {experts.map((expert) => (
              <article className="card expert-card" key={expert._id}>
                <h3>{expert.name}</h3>
                <p>Category: {expert.category}</p>
                <p>Experience: {expert.experience} years</p>
                <p>Rating: {expert.rating} / 5</p>
                <Link className="btn details-btn" to={`/experts/${expert._id}`}>
                  View Details
                </Link>
              </article>
            ))}
          </div>

          <div className="pagination">
            <button
              onClick={() => fetchExperts(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              Prev
            </button>
            <span>
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)}
            </span>
            <button
              onClick={() => fetchExperts(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
};

export default ExpertListPage;
