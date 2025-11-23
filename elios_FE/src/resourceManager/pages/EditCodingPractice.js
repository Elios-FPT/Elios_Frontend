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
    testCases: []
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
            topics: d.topics?.join(', ') || '',
            testCases: d.testCases || []
          });
        }
      } catch (err) {
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

    // CHỈ GỬI NHỮNG FIELD NÀY → 200 OK ĐÃ TEST
    const payload = {
      title: formData.title.trim(),
      difficulty: formData.difficulty,
      description: formData.description,
      topics: formData.topics
        .split(',')
        .map(t => t.trim())
        .filter(Boolean),
      testCases: formData.testCases
      // acceptanceRate: KHÔNG GỬI → backend giữ nguyên giá trị cũ
    };

    try {
      const res = await axios.put(API_ENDPOINTS.UPDATE_CODE_PRACTICE(id), payload, {
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });

      if (res.data.status === 200) {
        alert('Problem updated successfully!');
        navigate('/manage-coding-bank');
      }
    } catch (err) {
      console.error('Update failed:', err.response?.data);
      setError('Update failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="full-screen-loader"><div className="spinner"></div><p>Loading...</p></div>;

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
                <input name="title" value={formData.title} onChange={handleChange} required className="form-input" />
              </div>
              <div className="form-group">
                <label>Difficulty *</label>
                <select name="difficulty" value={formData.difficulty} onChange={handleChange} className="form-select">
                  <option value="EASY">Easy</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HARD">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Topics (comma-separated)</label>
              <input name="topics" value={formData.topics} onChange={handleChange} placeholder="Math, String" className="form-input" />
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
                />
                <div className="markdown-preview" style={{
                  padding: '1.5rem',
                  background: '#1e1e1e',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  overflowY: 'auto',
                  color: '#fff'
                }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {formData.description || '*No content*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {formData.testCases.length > 0 && (
              <div className="form-group" style={{ marginBottom: '2rem', opacity: 0.8 }}>
                <label>Current Test Cases ({formData.testCases.length}) - Cannot edit here</label>
                <div style={{ background: '#1a1a1a', padding: '1rem', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {formData.testCases.map((tc, i) => (
                    <div key={i} style={{ margin: '0.5rem 0', color: '#8be9fd' }}>
                      <strong>{i + 1}.</strong> <code>{tc.input}</code> → <code>{tc.expectedOutput}</code>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="error-text">{error}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-success" disabled={saving}>
                {saving ? 'Saving...' : 'Update Problem'}
              </button>
              <button type="button" className="btn-cancel" onClick={() => navigate('/manage-coding-bank')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default EditCodingPractice;