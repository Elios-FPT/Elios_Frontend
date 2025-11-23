// src/resourceManager/pages/PromptDetail.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/PromptDetail.css';

const PromptDetail = () => {
  const { prompt_name } = useParams();
  const navigate = useNavigate();

  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activating, setActivating] = useState({}); // để disable nút khi đang activate

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [activeRes, historyRes] = await Promise.all([
          axios.get(API_ENDPOINTS.GET_ACTIVE_PROMPT(prompt_name), { withCredentials: true }),
          axios.get(API_ENDPOINTS.GET_PROMPT_VERSION_HISTORY(prompt_name), { withCredentials: true })
        ]);

        setCurrentPrompt(activeRes.data);
        setVersions(historyRes.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load prompt details');
      } finally {
        setLoading(false);
      }
    };

    if (prompt_name) fetchData();
  }, [prompt_name]);

  // Activate version bằng số version → lấy UUID từ API chi tiết → gọi activate
  const handleActivate = async (versionNumber) => {
    if (activating[versionNumber]) return;

    const input = window.prompt(
      `Activate v${versionNumber}\n\nEnter traffic percentage (0–100):`,
      '100'
    );
    if (input === null) return;

    const traffic = parseInt(input);
    if (isNaN(traffic) || traffic < 0 || traffic > 100) {
      alert('Please enter a valid number between 0 and 100');
      return;
    }

    if (!window.confirm(
      `Activate version v${versionNumber} with ${traffic}% traffic?\n\n` +
      (traffic === 100 ? '→ This will deactivate all other versions.' : '→ A/B testing mode.')
    )) return;

    setActivating(prev => ({ ...prev, [versionNumber]: true }));

    try {
      // Bước 1: Lấy UUID từ API chi tiết version
      const detailRes = await axios.get(
        API_ENDPOINTS.GET_SPECIFIC_PROMPT_VERSION(prompt_name, versionNumber),
        { withCredentials: true }
      );

      const promptId = detailRes.data.id; // ← UUID chính là đây!

      // Bước 2: Gọi đúng API activate
      await axios.patch(
        API_ENDPOINTS.ACTIVATE_PROMPT_VERSION(promptId),
        {
          traffic_percentage: traffic
        },
        { withCredentials: true }
      );

      alert(`Version v${versionNumber} activated successfully with ${traffic}% traffic!`);
      window.location.reload();
    } catch (err) {
      console.error('Activate error:', err);
      const msg = err.response?.data?.detail || err.message;
      alert('Activation failed: ' + msg);
    } finally {
      setActivating(prev => ({ ...prev, [versionNumber]: false }));
    }
  };

  if (loading) return <div className="full-screen-loader"><div className="spinner"></div><p>Loading prompt...</p></div>;
  if (error) return <div className="full-screen-loader error-text"><p>{error}</p></div>;
  if (!currentPrompt) return <div className="full-screen-loader"><p>Prompt not found</p></div>;

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">

          {/* Header */}
          <div className="tab-header">
            <div style={{ textAlign: 'left' }}>
              <h1>{currentPrompt.prompt_name}</h1>
              <p className="intro-text">
                Active version: <strong>v{currentPrompt.version}</strong> •{' '}
                Traffic: <strong style={{ color: 'var(--accent-green)' }}>
                  {currentPrompt.traffic_percentage}%
                </strong> •{' '}
                {versions.length} total version{versions.length !== 1 ? 's' : ''}
              </p>
            </div>
            <button className="btn-secondary" onClick={() => navigate('/manage-prompts')}>
              Back
            </button>
          </div>

          {/* Current Active Card */}
          <div className="current-active-card">
            <h2>Currently Serving Version</h2>
            <div className="active-meta">
              <div><strong>Version:</strong> v{currentPrompt.version}</div>
              <div><strong>Traffic:</strong> <span className="traffic-highlight">{currentPrompt.traffic_percentage}%</span></div>
              <div><strong>Temperature:</strong> {currentPrompt.temperature}</div>
              <div><strong>Max Tokens:</strong> {currentPrompt.max_tokens}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-bar">
            <button className="btn-success" onClick={() => navigate(`/manage-prompts/new-version/${prompt_name}`)}>
              + New Version (A/B Test)
            </button>
            <button className="btn-edit" onClick={() => navigate(`/manage-prompts/analytics/${prompt_name}`)}>
              View Analytics
            </button>
            <button className="btn-cancel" onClick={() => navigate(`/manage-prompts/audit/${prompt_name}`)}>
              Audit Trail
            </button>
          </div>

          {/* Version History */}
          <div className="versions-section">
            <h2>Version History</h2>
            <div className="projects-grid">
              {versions.map(v => (
                <div
                  key={v.version}
                  className={`project-card version-card ${v.is_active ? 'active' : ''}`}
                >
                  <div className="card-header">
                    <h3 className="card-title">
                      Version {v.version}
                      {v.is_active && <span className="difficulty-badge easy">ACTIVE</span>}
                      {v.is_active && v.traffic_percentage > 0 && (
                        <span className="difficulty-badge" style={{ background: '#ff00ff', color: '#000' }}>
                          SERVING {v.traffic_percentage}%
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="card-body">
                    <p className="card-meta"><strong>Traffic:</strong> {v.traffic_percentage}%</p>
                    <p className="card-meta"><strong>Created:</strong> {new Date(v.created_at).toLocaleString()}</p>
                    {v.change_summary && <p className="description">{v.change_summary}</p>}
                  </div>

                  <div className="card-actions">
                    <button
                      onClick={() => handleActivate(v.version)}
                      className="btn-success"
                      disabled={activating[v.version]}
                      style={{
                        opacity: activating[v.version] ? 0.7 : 1,
                        position: 'relative'
                      }}
                    >
                      {activating[v.version] ? 'Activating...' : 
                       v.is_active && v.traffic_percentage === 100 ? 'Active (100%)' : 'Activate'}
                    </button>

                    <button
                      onClick={() => navigate(`/manage-prompts/edit/${prompt_name}/${v.version}`)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
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