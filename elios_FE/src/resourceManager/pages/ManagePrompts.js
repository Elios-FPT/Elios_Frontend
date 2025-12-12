import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';

const ManagePrompts = () => {
  const navigate = useNavigate();
  const [groupedPrompts, setGroupedPrompts] = useState([]);
  const [paging, setPaging] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    is_active: null,
    include_deleted: false,
    page: 1,
    pageSize: 12
  });

  const fetchPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: filters.page,
        page_size: filters.pageSize,
        include_deleted: filters.include_deleted,
      };
      if (filters.is_active !== null) params.is_active = filters.is_active;

      const res = await axios.get(API_ENDPOINTS.LIST_PROMPTS, { params, withCredentials: true });

      const grouped = {};
      res.data.prompts.forEach(p => {
        if (!grouped[p.prompt_name]) {
          grouped[p.prompt_name] = {
            name: p.prompt_name,
            latest: p,
            versions: [],
            activeVersion: null,
            totalVersions: 0,
            hasActive: false,
          };
        }

        const group = grouped[p.prompt_name];
        group.versions.push(p);
        group.totalVersions++;

        if (!group.latest || new Date(p.created_at) > new Date(group.latest.created_at)) {
          group.latest = p;
        }

        if (p.is_active) {
          group.activeVersion = p;
          group.hasActive = true;
        }
      });

      const result = Object.values(grouped).map(g => ({
        ...g,
        versions: g.versions.sort((a, b) => b.version - a.version),
      }));

      setGroupedPrompts(result);
      setPaging({
        total: res.data.total,
        page: res.data.page,
        page_size: res.data.page_size,
        has_next: res.data.has_next
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load prompts');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const handleDelete = async (promptName) => {
    if (!window.confirm(`Soft delete "${promptName}" and all versions?`)) return;

    try {
      const latestId = groupedPrompts.find(g => g.name === promptName)?.latest?.id;
      if (latestId) {
        await axios.delete(API_ENDPOINTS.DELETE_PROMPT(latestId), { withCredentials: true });
        setGroupedPrompts(prev => prev.filter(g => g.name !== promptName));
        alert('Prompt soft-deleted');
      }
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  if (loading) return <div className="full-screen-loader"><div className="spinner"></div><p>Loading prompts...</p></div>;
  if (error) return <div className="full-screen-loader"><p className="error-text">{error}</p><button className="btn-success" onClick={fetchPrompts}>Retry</button></div>;

  return (
    <>
      
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <h1>Manage AI Prompts</h1>
            <p className="intro-text">Prompt templates • Version control • Publish & Activate</p>
            <button className="btn-success" onClick={() => navigate('/manage-prompts/create')}>
              + New Prompt
            </button>
          </div>

          <div className="filters-bar">
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select
                value={filters.is_active === null ? '' : filters.is_active}
                onChange={e => setFilters(prev => ({ ...prev, is_active: e.target.value === '' ? null : e.target.value === 'true', page: 1 }))}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="true">Has Active Version</option>
                <option value="false">No Active Version</option>
              </select>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" checked={filters.include_deleted} onChange={e => setFilters(prev => ({ ...prev, include_deleted: e.target.checked, page: 1 }))} />
                Show Deleted
              </label>
            </div>
            {paging && <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
              {paging.total} prompts • {groupedPrompts.reduce((sum, g) => sum + g.totalVersions, 0)} versions
            </div>}
          </div>

          <div className="projects-grid">
            {groupedPrompts.length === 0 ? (
              <p className="no-results">No prompts found</p>
            ) : (
              groupedPrompts.map(group => (
                <div key={group.name} className="project-card">
                  <div className="card-header">
                    <h3 className="card-title">
                      {group.name}
                      <small style={{ opacity: 0.7, marginLeft: 8 }}>
                        v{group.latest.version} • {group.totalVersions} version{group.totalVersions > 1 ? 's' : ''}
                      </small>
                    </h3>
                  </div>

                  <div className="card-body">
                    <p className="card-meta">
                      <strong>Active:</strong>{' '}
                      {group.activeVersion ? (
                        <span className="difficulty-badge easy">v{group.activeVersion.version}</span>
                      ) : (
                        <span className="difficulty-badge hard">None</span>
                      )}
                    </p>
                    <p className="card-meta">
                      <strong>Latest:</strong> {new Date(group.latest.created_at).toLocaleDateString()}
                      {group.latest.deleted_at && <span style={{ color: 'var(--accent-red)', marginLeft: 8 }}>Deleted</span>}
                    </p>
                  </div>

                  <div className="card-actions">
                    <button onClick={() => navigate(`/manage-prompts/${group.name}`)} className="btn-success">
                      View Details
                    </button>
                    <button onClick={() => navigate(`/manage-prompts/new-version/${group.name}`)} className="btn-edit">
                      New Version
                    </button>
                    {!group.latest.deleted_at && (
                      <button onClick={() => handleDelete(group.name)} className="btn-danger">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {paging && paging.total > paging.page_size && (
            <div className="pagination">
              <button disabled={filters.page === 1} onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))} className="page-btn">
                Previous
              </button>
              <span>Page {filters.page}</span>
              <button disabled={!paging.has_next} onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))} className="page-btn">
                Next
              </button>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default ManagePrompts;