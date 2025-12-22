// src/resourceManager/components/PromptForm.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm dòng này
import UserNavbar from '../../components/navbars/UserNavbar';

export const PromptForm = ({
  title,
  subtitle,
  formData,
  setFormData,
  onSubmit,
  submitText = "Save",
  saving = false,
  showChangeSummary = true
}) => {
  const navigate = useNavigate(); // Dùng react-router thay vì window.history.back()

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header" style={{ marginBottom: '2rem' }}>
            <div>
              <h1>{title}</h1>
              <p style={{ color: '#e5e5e5', margin: '0.5rem 0 0' }}>{subtitle}</p>
            </div>
            <button
              className="btn-secondary"
              onClick={() => navigate(-1)}
              style={{ minWidth: '120px', marginTop: '20px' }}
            >
              Back
            </button>
          </div>

          <form onSubmit={onSubmit} style={{ maxWidth: 1100, margin: '0 auto' }}>
            {showChangeSummary && (
              <div className="form-group">
                <label>Change Summary <span style={{ color: 'red' }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Improved JSON format, added examples..."
                  value={formData.change_summary || ''}
                  onChange={e => setFormData(prev => ({ ...prev, change_summary: e.target.value }))}
                  required
                  autoFocus
                />
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '2rem 0' }}>
              <textarea
                rows={18}
                placeholder="System Prompt"
                value={formData.system_prompt}
                onChange={e => setFormData(prev => ({ ...prev, system_prompt: e.target.value }))}
                style={{ padding: '1rem', borderRadius: '8px', background: '#2f2f2f', color: '#fff', fontSize: '14px', border: '1px solid #555' }}
              />
              <textarea
                rows={18}
                placeholder="User Template (use {{variable}} syntax)"
                value={formData.user_template}
                onChange={e => setFormData(prev => ({ ...prev, user_template: e.target.value }))}
                style={{ padding: '1rem', borderRadius: '8px', background: '#2f2f2f', color: '#fff', fontSize: '14px', border: '1px solid #555' }}
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1rem',
                background: '#1f1f1f',
                padding: '1.5rem',
                borderRadius: '8px',
                color: '#e5e5e5'
              }}
            >
              <input
                type="number"
                step="0.05"
                min="0"
                max="2"
                placeholder="Temperature"
                value={formData.temperature}
                onChange={e => setFormData(p => ({ ...p, temperature: parseFloat(e.target.value) || 0 }))}
                style={{
                  background: '#2a2a2a',
                  color: '#e5e5e5',
                  border: '1px solid #3a3a3a',
                  padding: '0.75rem',
                  borderRadius: '6px'
                }}
              />

              <input
                type="number"
                min="1"
                placeholder="Max Tokens"
                value={formData.max_tokens}
                onChange={e => setFormData(p => ({ ...p, max_tokens: parseInt(e.target.value) || 1 }))}
                style={{
                  background: '#2a2a2a',
                  color: '#e5e5e5',
                  border: '1px solid #3a3a3a',
                  padding: '0.75rem',
                  borderRadius: '6px'
                }}
              />

              <input
                type="number"
                step="0.05"
                min="0"
                max="1"
                placeholder="Top P"
                value={formData.top_p}
                onChange={e => setFormData(p => ({ ...p, top_p: parseFloat(e.target.value) || 0 }))}
                style={{
                  background: '#2a2a2a',
                  color: '#e5e5e5',
                  border: '1px solid #3a3a3a',
                  padding: '0.75rem',
                  borderRadius: '6px'
                }}
              />
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: '3rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate(-1)}
                disabled={saving}
                style={{ minWidth: 140 }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-success"
                disabled={saving}
                style={{ minWidth: 280 }}
              >
                {saving ? 'Saving...' : submitText}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};