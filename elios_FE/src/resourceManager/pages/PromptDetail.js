import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/PromptDetail.css';

const PromptDetail = () => {
  const { prompt_name } = useParams();
  const navigate = useNavigate();

  const [activePrompt, setActivePrompt] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activatingId, setActivatingId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [activeRes, historyRes] = await Promise.all([
          axios.get(API_ENDPOINTS.GET_ACTIVE_PROMPT(prompt_name), { withCredentials: true }).catch(() => ({ data: null })),
          axios.get(API_ENDPOINTS.GET_PROMPT_VERSION_HISTORY(prompt_name), { withCredentials: true })
        ]);

        console.log(activeRes.data);

        console.log(historyRes.data);

        setActivePrompt(activeRes.data);
        setVersions(historyRes.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load prompt');
      } finally {
        setLoading(false);
      }
    };

    if (prompt_name) fetchData();
  }, [prompt_name]);

  const handlePublish = async (promptId) => {
    if (!window.confirm('Publish this version? It will be available for activation.')) return;

    try {
      await axios.patch(API_ENDPOINTS.PUBLISH_DRAFT_PROMPT(promptId), {}, { withCredentials: true });
      alert('Published successfully!');
      window.location.reload();
    } catch (err) {
      alert('Publish failed: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleActivate = async (promptId, version) => {
    if (activatingId) return;

    const reason = window.prompt(`Activate v${version}\nEnter reason for activation:`);
    if (!reason?.trim()) return;

    setActivatingId(promptId);
    try {
      await axios.patch(API_ENDPOINTS.ACTIVATE_PROMPT_VERSION(promptId), {
        changed_by: 'admin',
        reason: reason.trim()
      }, { withCredentials: true });

      alert(`Version v${version} is now ACTIVE`);
      window.location.reload();
    } catch (err) {
      alert('Activation failed: ' + (err.response?.data?.detail || err.message));
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) return <div className="full-screen-loader"><div className="spinner"></div><p>Loading...</p></div>;
  if (error) return <div className="full-screen-loader error-text"><p>{error}</p></div>;

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <div>
              <h1>{prompt_name}</h1>
              <p className="intro-text">
                Active version: <strong>{activePrompt ? `v${activePrompt.version}` : 'None'}</strong> • {versions.length} version{versions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/manage-prompts')}>
              Back
            </button>
          </div>

          {activePrompt && (
            <div className="current-active-card">
              <h2>Currently Active Version</h2>
              <div className="active-meta">
                <div><strong>Version:</strong> v{activePrompt.version}</div>
                <div><strong>Temperature:</strong> {activePrompt.temperature}</div>
                <div><strong>Max Tokens:</strong> {activePrompt.max_tokens}</div>
                <div><strong>Created:</strong> {new Date(activePrompt.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          )}

          <div className="action-bar">
            <button className="btn-success" onClick={() => navigate(`/manage-prompts/create/${prompt_name}/-1`)}>
              + New Version
            </button>
            <button className="btn-edit" onClick={() => navigate(`/manage-prompts/analytics/${prompt_name}`)}>
              View Analytics
            </button>
            <button className="btn-cancel" onClick={() => navigate(`/manage-prompts/audit/${prompt_name}`)}>
              Audit Trail
            </button>
          </div>

          <div className="versions-section">
            <h2>Version History</h2>
            <div className="projects-grid">
              {versions.map(v => (
                <div key={v.id} className={`project-card version-card ${v.is_active ? 'active' : ''}`}>
                  <div className="card-header">
                    <h3 className="card-title">
                      Version {v.version}
                      {v.is_active && <span className="difficulty-badge easy">ACTIVE</span>}
                      {v.is_draft && <span className="difficulty-badge" style={{ background: '#ffa726' }}>DRAFT</span>}
                    </h3>
                  </div>

                  <div className="card-body">
                    <p><strong>Created:</strong> {new Date(v.created_at).toLocaleString()}</p>
                    {v.change_summary && <p><strong>Change:</strong> {v.change_summary}</p>}
                  </div>

                  <div className="card-actions">
                    {v.is_draft && (
                      <button onClick={() => handlePublish(v.id)} className="btn-success">
                        Publish
                      </button>
                    )}

                    {!v.is_draft && !v.is_active && (
                      <button
                        onClick={() => handleActivate(v.id, v.version)}
                        disabled={activatingId === v.id}
                        className="btn-success"
                      >
                        {activatingId === v.id ? 'Activating...' : 'Activate'}
                      </button>
                    )}

                    {v.is_draft ? (
                      <button
                        onClick={() => navigate(`/manage-prompts/edit/${prompt_name}/${v.version}`)}
                        className="btn-edit"
                      >
                        Edit Draft
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate(`/manage-prompts/create/${prompt_name}/${v.version}`)}
                        className="btn-primary"
                      >
                        New Version from This
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default PromptDetail;