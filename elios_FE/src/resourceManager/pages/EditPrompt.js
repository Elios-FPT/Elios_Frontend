import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';

const EditPrompt = () => {
  const { prompt_name, version } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [nextVersion, setNextVersion] = useState(null);
  const [latestVersion, setLatestVersion] = useState(null); 

  const [formData, setFormData] = useState({
    prompt_name: '',
    version: 1,
    system_prompt: '',
    user_template: '',
    temperature: 0.3,
    max_tokens: 2000,
    top_p: 0.95,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
    output_parser_type: 'json_output_parser',
    output_schema: {},
    input_variables: [],
    partial_variables: {},
    notes: '',
    change_summary: ''
  });

  const unescapeString = (str) => {
    if (!str) return '';
    return str
      .replace(/\\"/g, '"')
      .replace(/\\n/g, '\n')
      .replace(/\\\\/g, '\\')
      .replace(/\\t/g, '\t');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!prompt_name || !version) {
        setError('Missing prompt name or version');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        const [versionRes, historyRes] = await Promise.all([
          axios.get(API_ENDPOINTS.GET_SPECIFIC_PROMPT_VERSION(prompt_name, version), { withCredentials: true }),
          axios.get(API_ENDPOINTS.GET_PROMPT_VERSION_HISTORY(prompt_name), { withCredentials: true })
        ]);

        const data = versionRes.data;
        const history = historyRes.data || [];

        const maxVersion = history.length > 0
          ? Math.max(...history.map(v => v.version))
          : parseInt(version);

        setLatestVersion(maxVersion);
        setNextVersion(maxVersion + 1);

        setFormData({
          prompt_name: data.prompt_name || prompt_name,
          version: parseInt(data.version) || parseInt(version),
          system_prompt: unescapeString(data.system_prompt) || '',
          user_template: unescapeString(data.user_template) || '',
          temperature: parseFloat(data.temperature ?? 0.3),
          max_tokens: parseInt(data.max_tokens ?? 2000),
          top_p: parseFloat(data.top_p ?? 0.95),
          frequency_penalty: parseFloat(data.frequency_penalty ?? 0.0),
          presence_penalty: parseFloat(data.presence_penalty ?? 0.0),
          output_parser_type: data.output_parser_type || 'json_output_parser',
          output_schema: data.output_schema || {},
          input_variables: Array.isArray(data.input_variables) ? data.input_variables : [],
          partial_variables: data.partial_variables || {},
          notes: data.notes || '',
          change_summary: ''
        });

      } catch (err) {
        const msg = err.response?.data?.detail || err.message;
        setError('Failed to load prompt version: ' + msg);
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prompt_name, version]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.change_summary?.trim()) {
      alert('Please provide a Change Summary');
      return;
    }

    const confirmed = window.confirm(
      `Create new version v${nextVersion}?\n\nSummary: "${formData.change_summary.trim()}"`
    );
    if (!confirmed) return;

    setSaving(true);

    try {
      const payload = {
        parent_version: formData.version,
        created_by: 'admin',
        ...(formData.system_prompt.trim() && { system_prompt: formData.system_prompt.trim() }),
        ...(formData.user_template.trim() && { user_template: formData.user_template.trim() }),
        temperature: Number(formData.temperature),
        max_tokens: Number(formData.max_tokens),
        top_p: Number(formData.top_p),
        frequency_penalty: Number(formData.frequency_penalty),
        presence_penalty: Number(formData.presence_penalty),
        output_parser_type: formData.output_parser_type,
        ...(Object.keys(formData.output_schema || {}).length > 0 && { output_schema: formData.output_schema }),
        ...(formData.input_variables.length > 0 && { input_variables: formData.input_variables }),
        ...(Object.keys(formData.partial_variables || {}).length > 0 && { partial_variables: formData.partial_variables }),
        change_summary: formData.change_summary.trim(),
        ...(formData.notes.trim() && { notes: formData.notes.trim() })
      };

      const response = await axios.post(
        API_ENDPOINTS.CREATE_PROMPT_VERSION(formData.prompt_name),
        payload,
        { withCredentials: true }
      );

      alert(`Success! Created version v${response.data.version || nextVersion}`);
      navigate(`/manage-prompts/${formData.prompt_name}`);
    } catch (err) {
      console.error('Create version error:', err.response?.data || err);
      const details = err.response?.data?.detail || err.message;
      alert('Failed to create new version:\n' + (Array.isArray(details) ? details.map(d => `• ${d.loc.join(' → ')}: ${d.msg}`).join('\n') : details));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="full-screen-loader"><div className="spinner"></div><p>Loading version {version}...</p></div>;
  if (error) return <div className="full-screen-loader error-text"><p>{error}</p><button className="btn-success" onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">

          <div className="tab-header">
            <div>
              <h1>
                Edit Prompt: <span style={{ color: 'var(--accent-green)' }}>{formData.prompt_name}</span>
              </h1>
              <p className="intro-text">
                Current: <strong>v{formData.version}</strong> → Creating:{' '}
                <strong style={{ color: 'var(--accent-green)', fontSize: '1.5em', fontWeight: 700 }}>
                  v{nextVersion}
                </strong>
                {latestVersion > formData.version && (
                  <span style={{ marginLeft: 16, color: '#ff9800', fontWeight: 600 }}>
                    (Latest version is v{latestVersion})
                  </span>
                )}
              </p>
            </div>
            <button className="btn-secondary" onClick={() => navigate(-1)} disabled={saving}>
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ maxWidth: 1000, margin: '0 auto' }}>

            <div className="form-group">
              <label style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '1.1em' }}>
                Change Summary <span style={{ color: 'var(--accent-red)' }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Improved output format, fixed JSON parsing"
                value={formData.change_summary}
                onChange={(e) => handleChange('change_summary', e.target.value)}
                required
                autoFocus
                style={{ borderColor: formData.change_summary.trim() ? 'var(--accent-green)' : 'var(--accent-red)' }}
              />
              <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: 4 }}>
                Required for version history
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', margin: '2.5rem 0' }}>
              <div className="form-group">
                <label>System Prompt</label>
                <textarea rows={16} className="form-textarea" value={formData.system_prompt} onChange={e => handleChange('system_prompt', e.target.value)} />
              </div>
              <div className="form-group">
                <label>User Template (use &#123;&#123;var&#125;&#125; syntax)</label>
                <textarea rows={16} className="form-textarea" value={formData.user_template} onChange={e => handleChange('user_template', e.target.value)} />
              </div>
            </div>

            <h3 style={{ margin: '2.5rem 0 1rem' }}>Model Parameters</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
              padding: '1.5rem',
              background: 'var(--bg-secondary)',
              borderRadius: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <div className="form-group"><label>Temperature</label><input type="number" step="0.05" min="0" max="2" className="form-input" value={formData.temperature} onChange={e => handleChange('temperature', parseFloat(e.target.value) || 0)} /></div>
              <div className="form-group"><label>Max Tokens</label><input type="number" min="1" className="form-input" value={formData.max_tokens} onChange={e => handleChange('max_tokens', parseInt(e.target.value) || 1)} /></div>
              <div className="form-group"><label>Top P</label><input type="number" step="0.05" min="0" max="1" className="form-input" value={formData.top_p} onChange={e => handleChange('top_p', parseFloat(e.target.value) || 0)} /></div>
              <div className="form-group"><label>Frequency Penalty</label><input type="number" step="0.1" min="-2" max="2" className="form-input" value={formData.frequency_penalty} onChange={e => handleChange('frequency_penalty', parseFloat(e.target.value) || 0)} /></div>
              <div className="form-group"><label>Presence Penalty</label><input type="number" step="0.1" min="-2" max="2" className="form-input" value={formData.presence_penalty} onChange={e => handleChange('presence_penalty', parseFloat(e.target.value) || 0)} /></div>
              <div className="form-group">
                <label>Output Parser</label>
                <select className="form-select" value={formData.output_parser_type} onChange={e => handleChange('output_parser_type', e.target.value)}>
                  <option value="json_output_parser">JSON Parser</option>
                  <option value="pydantic">Pydantic Model</option>
                  <option value="none">None (Raw Text)</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '2.5rem' }}>
              <label>Notes (optional)</label>
              <textarea rows={4} className="form-textarea" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} placeholder="A/B test results, deployment notes..." />
            </div>

            <div className="form-actions" style={{ marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn-cancel" onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
              <button
                type="submit"
                className="btn-success"
                disabled={saving || !formData.change_summary.trim()}
                style={{ minWidth: 280, fontWeight: 600, fontSize: '1.1em' }}
              >
                {saving ? 'Creating...' : `Create v${nextVersion}`}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
};

export default EditPrompt;