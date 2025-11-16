// src/resourceManager/pages/ViewMockProject.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiExternalLink, FiChevronLeft, FiList, FiUsers } from 'react-icons/fi';

const ViewMockProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_MOCK_PROJECT_DETAIL(id), { withCredentials: true });
        if (res.data.status === 200 && res.data.responseData) {
          setProject(res.data.responseData);
        } else {
          throw new Error(res.data.message || 'Unknown error');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p>Loading project details...</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="full-screen-loader">
        <p className="error-text">{error || 'Project not found'}</p>
        <button className="btn-success" onClick={() => navigate('/manage-project-bank')}>
          Back to Projects
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
            <h1>{project.title}</h1>
            <p className="intro-text">Project details and overview.</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/manage-project-bank')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiChevronLeft /> Back
              </button>
              <button
                type="button"
                className="btn-success"
                onClick={() => navigate(`/manage-project-bank/edit/${id}/processes`)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiList /> View Steps
              </button>
              <button
                type="button"
                className="btn-success"
                onClick={() => navigate(`/project/${id}/submissions`)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <FiUsers /> Review Submissions
              </button>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Title & Language */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Title</label>
                <div className="readonly-field">{project.title}</div>
              </div>
              <div className="form-group">
                <label>Language</label>
                <div className="readonly-field">{project.language}</div>
              </div>
            </div>

            {/* Difficulty */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Difficulty</label>
              <div className="readonly-field">
                <span className={`difficulty-badge ${project.difficulty.toLowerCase()}`}>
                  {project.difficulty}
                </span>
              </div>
            </div>

            {/* Description with Preview Only */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Description</label>
              <div
                className="markdown-preview"
                style={{
                  padding: '1.5rem',
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  minHeight: '300px',
                  overflowY: 'auto',
                  color: '#fff',
                  fontSize: '1rem',
                  lineHeight: '1.7'
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {project.description || '*No description provided.*'}
                </ReactMarkdown>
              </div>
            </div>

            {/* Optional Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>File Name</label>
                <div className="readonly-field">{project.fileName || '—'}</div>
              </div>
              <div className="form-group">
                <label>Key Prefix</label>
                <div className="readonly-field">{project.keyPrefix || '—'}</div>
              </div>
            </div>

            {/* Base Project URL */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>Base Project ZIP</label>
              {project.baseProjectUrl ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <a
                    href={project.baseProjectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="readonly-field"
                    style={{
                      color: '#4ade80',
                      textDecoration: 'underline',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <FiExternalLink /> Open ZIP File
                  </a>
                </div>
              ) : (
                <div className="readonly-field">—</div>
              )}
            </div>

            {/* Meta Info */}
            <div style={{ color: '#888', fontSize: '0.9rem', marginTop: '2rem' }}>
              <p><strong>Created:</strong> {new Date(project.createdAt).toLocaleString()}</p>
              {project.updatedAt && (
                <p><strong>Last Updated:</strong> {new Date(project.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* CSS cho readonly field */}
      <style jsx>{`
        .readonly-field {
          padding: 0.75rem 1rem;
          background: #2a2a2a;
          border: 1px solid #444;
          border-radius: 8px;
          color: #e0e0e0;
          font-size: 0.95rem;
        }
      `}</style>
    </>
  );
};

export default ViewMockProject;