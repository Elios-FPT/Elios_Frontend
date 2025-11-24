// src/resourceManager/pages/CreateNewPrompt.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';

const CreateNewPrompt = () => {
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    prompt_name: '',
    system_prompt: '',
    user_template: '',
    temperature: 0.7,
    max_tokens: 2000,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
    output_parser_type: 'json_output_parser',
    created_by: 'admin'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const name = formData.prompt_name.trim();
    if (!name) {
      alert('Prompt name is required!');
      return;
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      alert('Prompt name can only contain letters, numbers, underscore (_) and hyphen (-)');
      return;
    }

    setSaving(true);
    try {
      const res = await axios.post(API_ENDPOINTS.CREATE_INITIAL_PROMPT, formData, {
        withCredentials: true
      });

      alert(`Prompt "${name}" created successfully as v1 (draft)!`);
      navigate(`/manage-prompts/${name}`);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      if (msg.includes('already exists')) {
        alert(`Prompt "${name}" already exists! Please choose another name.`);
      } else {
        alert('Failed to create prompt: ' + msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          {/* Header với nút Back */}
          <div className="tab-header" style={{ marginBottom: '2rem' }}>
            <div>
              <h1>Create New Prompt</h1>
              <p style={{ color: '#e5e5e5', margin: '0.5rem 0 0' }}>
                Create a completely new AI prompt template • Version 1 will be created as draft
              </p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => navigate('/manage-prompts')}
              style={{ minWidth: '120px' }}
            >
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ maxWidth: 1100, margin: '0 auto' }}>
            {/* Prompt Name */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label>
                Prompt Name <span style={{ color: 'red' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. gap_detection, interview_generator_v2"
                value={formData.prompt_name}
                onChange={e => handleChange('prompt_name', e.target.value)}
                required
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #555',
                  background: '#2f2f2f',
                  color: '#fff',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.9rem', color: '#aaa' }}>
                Only letters, numbers, underscore (_) and hyphen (-) allowed. This name cannot be changed later.
              </p>
            </div>

            {/* System Prompt & User Template */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '2rem 0' }}>
              <div>
                <label>System Prompt</label>
                <textarea
                  rows={18}
                  placeholder="You are a helpful assistant that..."
                  value={formData.system_prompt}
                  onChange={e => handleChange('system_prompt', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: '#2f2f2f',
                    color: '#fff',
                    fontSize: '14px',
                    border: '1px solid #555',
                    resize: 'vertical',
                    marginTop: '0.5rem'
                  }}
                />
              </div>
              <div>
                <label>User Template (use {"{{variable}}"} syntax)</label>
                <textarea
                  rows={18}
                  placeholder="Analyze the following resume and return JSON with fields: {{fields}}..."
                  value={formData.user_template}
                  onChange={e => handleChange('user_template', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '8px',
                    background: '#2f2f2f',
                    color: '#fff',
                    fontSize: '14px',
                    border: '1px solid #555',
                    resize: 'vertical',
                    marginTop: '0.5rem'
                  }}
                />
              </div>
            </div>

            {/* Parameters */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                background: '#1f1f1f',
                padding: '1.5rem',
                borderRadius: '8px',
                marginBottom: '2rem'
              }}
            >
              <div>
                <label>Temperature</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="2"
                  value={formData.temperature}
                  onChange={e => handleChange('temperature', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#2a2a2a', color: '#e5e5e5', border: '1px solid #3a3a3a', marginTop: '0.5rem' }}
                />
              </div>

              <div>
                <label>Max Tokens</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_tokens}
                  onChange={e => handleChange('max_tokens', parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#2a2a2a', color: '#e5e5e5', border: '1px solid #3a3a3a', marginTop: '0.5rem' }}
                />
              </div>

              <div>
                <label>Top P</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={formData.top_p}
                  onChange={e => handleChange('top_p', parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#2a2a2a', color: '#e5e5e5', border: '1px solid #3a3a3a', marginTop: '0.5rem' }}
                />
              </div>

              <div>
                <label>Output Parser</label>
                <select
                  value={formData.output_parser_type}
                  onChange={e => handleChange('output_parser_type', e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', background: '#2a2a2a', color: '#e5e5e5', border: '1px solid #3a3a3a', marginTop: '0.5rem' }}
                >
                  <option value="json_output_parser">JSON Parser</option>
                  <option value="pydantic">Pydantic</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ textAlign: 'right', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/manage-prompts')}
                disabled={saving}
                style={{ minWidth: 140, marginRight: '1rem' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-success"
                disabled={saving}
                style={{ minWidth: 280 }}
              >
                {saving ? 'Creating...' : 'Create Prompt (v1 Draft)'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default CreateNewPrompt;