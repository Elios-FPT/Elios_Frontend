// src/resourceManager/pages/EditCodingPractice.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiChevronLeft } from 'react-icons/fi';

const EditCodingPractice = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'MEDIUM',
    description: '',
    topics: '',
    testCases: [],
    topicIds: [] // ✅ Thêm topicIds
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_CODE_PRACTICE_DETAIL(id), { withCredentials: true });
        if (res.data.status === 200 && res.data.data) {
          const d = res.data.data;
          setFormData({
            title: d.title || '',
            difficulty: d.difficulty || 'MEDIUM',
            description: d.description || '',
            // ✅ topics → topicIds (array UUIDs)
            topics: d.topics?.join(', ') || '',
            topicIds: d.topics || [], // Giữ nguyên array topics từ backend
            // ✅ testCases giữ nguyên đầy đủ fields
            testCases: d.testCases || []
          });
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError('Failed to load problem');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    console.log(formData.topics);

    const payload = {
      title: formData.title.trim(),
      description: formData.description,
      difficulty: formData.difficulty,
      topicIds: formData.topics || [],
      testCases: (formData.testCases || []).map((tc, index) => ({
        ...tc, 
        order: (tc.order || index + 1),
        visibility: (tc.visibility || 'PUBLIC')
      }))
    };
    try {
      const res = await axios.patch(API_ENDPOINTS.UPDATE_CODE_PRACTICE(id), payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.data.status === 200) {
        alert('Problem updated successfully!');
        navigate('/manage-coding-bank');
      }
    } catch (err) {
      console.error('Update failed:', err.response?.data || err);

      if (err.response?.data?.validationErrors) {
        const errors = Object.entries(err.response.data.validationErrors)
          .map(([field, message]) => `${field}: ${message}`)
          .join('\n');
        setError(`Validation failed:\n${errors}`);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Update failed. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <h1>Edit Coding Problem</h1>
            <button className="btn-cancel" onClick={() => navigate('/manage-coding-bank')}>
              <FiChevronLeft /> Back
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ padding: '32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Difficulty *</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Topics</label>
              <input
                name="topics"
                value={formData.topics}
                onChange={handleChange}
                placeholder="Math, String, Array (display only)"
                className="form-input"
                disabled
                style={{
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'not-allowed'
                }}
              />
              <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Topics are managed separately. Current: {formData.topicIds.length} topics
              </small>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>Description (Markdown) *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="form-textarea"
                  style={{ minHeight: '500px', fontFamily: 'monospace' }}
                  placeholder="Write problem description using Markdown..."
                />
                <div
                  className="markdown-preview"
                  style={{
                    padding: '1.5rem',
                    background: '#1e1e1e',
                    border: '1px solid #333',
                    borderRadius: '8px',
                    overflowY: 'auto',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formData.description || '*Preview will appear here...'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {formData.testCases.length > 0 && (
              <div className="form-group" style={{ marginBottom: '2rem', opacity: 0.8 }}>
                <label>Current Test Cases ({formData.testCases.length})</label>
                <div style={{
                  background: '#1a1a1a',
                  padding: '1rem',
                  borderRadius: '8px',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  maxHeight: '600px',
                  overflowY: 'auto'
                }}>
                  {formData.testCases.map((tc, i) => (
                    <div
                      key={i}
                      style={{
                        margin: '0.75rem 0',
                        padding: '1rem',
                        background: '#2d2d2d',
                        borderRadius: '8px',
                        borderLeft: '4px solid #8be9fd'
                      }}
                    >
                      <div style={{ color: '#8be9fd', marginBottom: '0.5rem' }}>
                        <strong>Test Case #{i + 1} (Order: {tc.order})</strong>
                        <span style={{
                          marginLeft: '1rem',
                          padding: '0.25rem 0.5rem',
                          background: '#50fa7b20',
                          color: '#50fa7b',
                          borderRadius: '4px',
                          fontSize: '0.8rem'
                        }}>
                          {tc.visibility || 'PUBLIC'}
                        </span>
                      </div>
                      <div style={{ color: '#f1fa8c', marginBottom: '0.5rem' }}>
                        <strong>Input:</strong>
                        <pre style={{
                          margin: '0.5rem 0',
                          padding: '0.75rem',
                          background: '#0d111720',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          border: '1px solid #21262d'
                        }}>{tc.input}</pre>
                      </div>
                      <div style={{ color: '#50fa7b' }}>
                        <strong>Expected Output:</strong>
                        <pre style={{
                          margin: '0.5rem 0',
                          padding: '0.75rem',
                          background: '#0d111720',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          border: '1px solid #21262d'
                        }}>{tc.expectedOutput}</pre>
                      </div>
                    </div>
                  ))}
                </div>
                <small style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem', display: 'block' }}>
                  ✓ Test cases will be preserved during update
                </small>
              </div>
            )}

            {error && (
              <div
                className="error-text"
                style={{
                  background: '#fee2e2',
                  color: '#dc2626',
                  padding: '1.25rem',
                  borderRadius: '8px',
                  border: '1px solid #fecaca',
                  whiteSpace: 'pre-line',
                  marginBottom: '1.5rem',
                  fontFamily: 'monospace'
                }}
              >
                <strong>Error:</strong>
                <br />
                {error}
              </div>
            )}

            <div className="form-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/manage-coding-bank')}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-success"
                disabled={saving || !formData.title.trim()}
              >
                {saving ? (
                  <>
                    <span className="spinner" style={{ marginRight: '0.5rem', display: 'inline-block' }}></span>
                    Saving...
                  </>
                ) : (
                  'Update Problem'
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default EditCodingPractice;