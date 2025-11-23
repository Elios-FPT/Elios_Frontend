// src/resourceManager/pages/CreateCodingPractice.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiChevronLeft } from 'react-icons/fi';

const CreateCodingPractice = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'MEDIUM',
    description: '',
    topics: '',
    acceptanceRate: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...formData,
      topics: formData.topics.split(',').map(t => t.trim()).filter(Boolean),
      acceptanceRate: formData.acceptanceRate ? parseFloat(formData.acceptanceRate) : null
    };

    try {
      const res = await axios.post(API_ENDPOINTS.CREATE_CODE_PRACTICE, payload, {
        withCredentials: true
      });

      if (res.data.status === 200) {
        alert('Problem created successfully!');
        navigate('/manage-coding-bank');
      } else {
        throw new Error(res.data.message || 'Create failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create problem');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <h1>Create New Coding Problem</h1>
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
              <input name="topics" value={formData.topics} onChange={handleChange} placeholder="Array, String, DP" className="form-input" />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label>Description (Markdown) *</label>
              <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1rem' }}>
                Live preview on the right
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="form-textarea"
                  style={{ minHeight: '480px', fontFamily: 'monospace' }}
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
                    {formData.description || '*Start typing...*'}
                  </ReactMarkdown>
                </div>
              </div>
            </div>

            {error && <p className="error-text">{error}</p>}

            <div className="form-actions">
              <button type="submit" className="btn-success" disabled={saving}>
                {saving ? 'Creating...' : 'Create Problem'}
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

export default CreateCodingPractice;