// src/resourceManager/pages/ManageProjectBank.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';

const ManageProjectBank = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [paging, setPaging] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    language: '',
    difficulty: '',
    page: 1,
    pageSize: 12
  });

  // Fetch Projects
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.language) params.append('Language', filters.language);
      if (filters.difficulty) params.append('Difficulty', filters.difficulty);
      params.append('Page', String(filters.page));
      params.append('PageSize', String(filters.pageSize));

      const url = `${API_ENDPOINTS.GET_MOCK_PROJECTS_LIST}?${params.toString()}`;
      console.log('Fetching:', url);

      const res = await axios.get(url, { withCredentials: true });

      if (res.data.status === 200 && res.data.responseData) {
        const data = res.data.responseData;
        setProjects(data.pagedData || []);
        setPaging(data);
      } else {
        throw new Error(res.data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load projects';
      setError(msg);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Delete Project
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This action cannot be undone.')) return;

    try {
      const res = await axios.delete(API_ENDPOINTS.DELETE_MOCK_PROJECT(id), {
        withCredentials: true
      });

      if (res.data.status === 200 && res.data.responseData === true) {
        setProjects(prev => prev.filter(p => p.id !== id));
        alert('Project deleted successfully');
      } else {
        throw new Error(res.data.message || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Delete failed. Please try again.');
    }
  };

  // Edit & Create
  const handleEdit = (id) => {
    navigate(`/manage-project-bank/edit/${id}`);
  };

  const handleCreate = () => {
    navigate('/manage-project-bank/create');
  };

  // Pagination & Filter
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  // Loading
  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p>Loading project bank...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="full-screen-loader">
        <p className="error-text">{error}</p>
        <button className="btn-success" onClick={fetchProjects} style={{ marginTop: '1rem' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <h1>Manage Project Bank</h1>
            <p className="intro-text">Manage all mock interview projects.</p>
            <button className="btn-success" onClick={handleCreate}>
              + New Project
            </button>
          </div>

          {/* Filters */}
          <div
            className="filters-bar"
            style={{
              padding: '16px 64px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="filter-select"
                style={{ minWidth: 160 }}
              >
                <option value="">All Languages</option>
                <option value="JavaScript">JavaScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C#">C#</option>
              </select>

              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="filter-select"
                style={{ minWidth: 160 }}
              >
                <option value="">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {paging && (
              <div
                style={{
                  marginLeft: 'auto',
                  color: '#888',
                  fontSize: '0.9rem',
                  whiteSpace: 'nowrap',
                }}
              >
                {paging.totalRecords} projects
              </div>
            )}
          </div>


          {/* Projects Grid */}
          <div className="projects-grid">
            {projects.length > 0 ? (
              projects.map(project => (
                <div key={project.id} className="project-card">
                  <h3>{project.title}</h3>
                  <p><strong>Language:</strong> {project.language}</p>
                  <p>
                    <strong>Difficulty:</strong>{' '}
                    <span className={`difficulty-badge ${project.difficulty.toLowerCase()}`}>
                      {project.difficulty}
                    </span>
                  </p>
                  <p className="description">{project.description}</p>
                  <p className="meta">
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>

                  <div className="card-actions">
                    <button onClick={() => navigate(`/manage-project-bank/view/${project.id}`)} className="btn-view">
                      View
                    </button>
                    <button onClick={() => handleEdit(project.id)} className="btn-edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(project.id)} className="btn-danger">
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">
                No projects found. <a href="#" onClick={(e) => { e.preventDefault(); handleCreate(); }}>Create one?</a>
              </p>
            )}
          </div>

          {/* Pagination */}
          {paging && paging.totalPages > 1 && (
            <div className="pagination" style={{ textAlign: 'center', padding: '32px' }}>
              <button
                disabled={filters.page === 1}
                onClick={() => handlePageChange(filters.page - 1)}
                className="page-btn"
              >
                Previous
              </button>

              <span style={{ margin: '0 1rem', color: '#aaa' }}>
                Page {filters.page} of {paging.totalPages}
              </span>

              <button
                disabled={filters.page === paging.totalPages}
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

export default ManageProjectBank;