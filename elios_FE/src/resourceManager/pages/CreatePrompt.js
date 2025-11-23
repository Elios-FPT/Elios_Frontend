// src/resourceManager/pages/CreatePrompt.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';

const CreatePrompt = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    prompt_name: '',
    system_prompt: '',
    user_template: '',
    temperature: 0.3,
    max_tokens: 2000,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
    output_parser_type: 'json_output_parser',
    output_schema: {}
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.prompt_name.trim()) {
      setError('Prompt name is required');
      return;
    }

    setLoading(true);
    try {
      await axios.post(API_ENDPOINTS.CREATE_INITIAL_PROMPT, formData, {
        withCredentials: true
      });
      alert('Prompt created successfully!');
      navigate('/manage-prompts');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create prompt');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <h1>Create New Prompt</h1>
            <button className="btn-secondary" onClick={() => navigate('/manage-prompts')}>
              ← Back to List
            </button>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleSubmit} className="project-card" style={{ maxWidth: 800 }}>
            <div style={{ marginBottom: '1rem' }}>
              <label>Prompt Name <span style={{color: 'red'}}>*</span></label>
              <input
                type="text"
                value={formData.prompt_name}
                onChange={e => setFormData(prev => ({ ...prev, prompt_name: e.target.value }))}
                placeholder="e.g. cv_summary, skill_extraction"
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>System Prompt</label>
              <textarea
                rows={6}
                value={formData.system_prompt}
                onChange={e => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                placeholder="You are a helpful HR assistant..."
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>User Template (use)</label>
              <textarea
                rows={6}
                value={formData.user_template}
                onChange={e => setFormData(prev => ({ ...prev, user_template: e.target.value }))}
                placeholder="Extract skills from this CV: {{cv_text}}"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label>Temperature</label>
                <input type="number" min="0" max="2" step="0.1" value={formData.temperature}
                  onChange={e => setFormData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}/>
              </div>
              <div>
                <label>Max Tokens</label>
                <input type="number" min="1" max="4096" value={formData.max_tokens}
                  onChange={e => setFormData(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}/>
              </div>
              <div>
                <label>Top P</label>
                <input type="number" min="0" max="1" step="0.05" value={formData.top_p}
                  onChange={e => setFormData(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}/>
              </div>
              <div>
                <label>Output Parser</label>
                <select value={formData.output_parser_type}
                  onChange={e => setFormData(prev => ({ ...prev, output_parser_type: e.target.value }))}>
                  <option value="json_output_parser">JSON Parser</option>
                  <option value="pydantic">Pydantic</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'right' }}>
              <button type="submit" disabled={loading} className="btn-success">
                {loading ? 'Creating...' : 'Create Prompt'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreatePrompt;