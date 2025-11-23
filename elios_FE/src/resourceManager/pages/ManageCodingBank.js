import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageCoding.css';

const ManageCodingBank = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [paging, setPaging] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    sort: 'title',
    order: 'asc',
    page: 0,
    size: 12
  });

  const fetchProblems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (filters.search) params.append('search', filters.search);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);

      const order = filters.sort === 'title' ? 'asc' : 'desc';
      params.append('sort', filters.sort);
      params.append('order', order);

      params.append('page', String(filters.page));
      params.append('size', String(filters.size));

      const url = `${API_ENDPOINTS.GET_CODE_PRACTICES_LIST}?${params.toString()}`;
      console.log('Fetching coding problems:', url);

      const res = await axios.get(url, { withCredentials: true });

      if (res.data.status === 200 && res.data.data) {
        const listResponse = res.data.data;
        setProblems(listResponse.content || []);
        setPaging({
          totalElements: listResponse.totalElements,
          totalPages: listResponse.totalPages,
          page: listResponse.page,
          size: listResponse.size,
          first: listResponse.first,
          last: listResponse.last
        });
      } else {
        throw new Error(res.data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load coding problems';
      setError(msg);
      setProblems([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  const handleDelete = (id) => {
    alert('Delete feature not available yet.');
  };

  const handleEdit = (id) => {
    navigate(`/manage-coding-bank/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/manage-coding-bank/create');
  };

  const handleView = (id) => {
    navigate(`/manage-coding-bank/view/${id}`);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0,

      order: key === 'sort' ? (value === 'title' ? 'asc' : 'desc') : prev.order
    }));
  };

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p>Loading coding bank...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-screen-loader">
        <p className="error-text">{error}</p>
        <button className="btn-success" onClick={fetchProblems}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <h1>Manage Coding Bank</h1>
            <p className="intro-text">Manage all coding practice problems.</p>
            <button className="btn-success" onClick={handleCreate}>
              + New Problem
            </button>
          </div>

          { }
          <div className="filters-bar" style={{ marginTop: 20 }}>
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search by title..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="filter-input"
              />
            </div>

            {paging && (
              <div className="results-count">
                {paging.totalElements} problems
              </div>
            )}
          </div>

          { }
          <div className="problems-grid">
            {problems.length > 0 ? (
              problems.map(problem => (
                <div key={problem.id} className="problem-card">
                  <h3 className="problem-title">{problem.title}</h3>

                  <div className="problem-meta">
                    <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                      {problem.difficulty}
                    </span>
                    {problem.acceptanceRate !== null && (
                      <span className="acceptance-rate">
                        {(problem.acceptanceRate * 100).toFixed(1)}% Accepted
                      </span>
                    )}
                  </div>

                  <div className="topics-list">
                    {problem.topics?.length > 0 ? (
                      problem.topics.map((topic, i) => (
                        <span key={i} className="topic-tag">{topic}</span>
                      ))
                    ) : (
                      <span className="topic-tag muted">No topics</span>
                    )}
                  </div>

                  <p className="description">
                    {problem.description?.substring(0, 150) || 'No description.'}
                    {problem.description?.length > 150 && '...'}
                  </p>

                  <p className="meta">
                    Created: {new Date(problem.createdAt).toLocaleDateString()}
                  </p>

                  <div className="card-actions">
                    <button onClick={() => handleView(problem.id)} className="btn-view">
                      View
                    </button>
                    <button onClick={() => handleEdit(problem.id)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(problem.id)} className="btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">
                No coding problems found.{' '}
                <a href="#" onClick={(e) => { e.preventDefault(); handleCreate(); }}>
                  Create one?
                </a>
              </p>
            )}
          </div>

          { }
          {paging && paging.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={paging.first}
                onClick={() => handlePageChange(filters.page - 1)}
                className="page-btn"
              >
                Previous
              </button>

              <span>
                Page {filters.page + 1} of {paging.totalPages}
              </span>

              <button
                disabled={paging.last}
                onClick={() => handlePageChange(filters.page + 1)}
                className="page-btn"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ManageCodingBank;