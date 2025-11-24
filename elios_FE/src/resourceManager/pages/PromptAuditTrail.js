import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';

const PromptAuditTrail = () => {
  const { prompt_name } = useParams();
  const navigate = useNavigate();
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAuditTrail = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          API_ENDPOINTS.GET_PROMPT_AUDIT_TRAIL(prompt_name),
          { withCredentials: true }
        );
        setAuditLogs((res.data || []).sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at)));
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load audit trail');
      } finally {
        setLoading(false);
      }
    };

    if (prompt_name) fetchAuditTrail();
  }, [prompt_name]);

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getFieldColor = (field) => {
    const colors = {
      is_active: '#10b981',
      is_draft: '#f59e0b',
      temperature: '#8b5cf6',
      max_tokens: '#3b82f6',
      default: '#6b7280'
    };
    return colors[field] || colors.default;
  };

  const getActionLabel = (log) => {
    if (log.field_name === 'is_active') {
      return log.new_value === 'True' ? 'Activated' : 'Deactivated';
    }
    if (log.field_name === 'is_draft' && log.new_value === 'False') {
      return 'Published';
    }
    if (log.field_name === 'is_draft' && log.new_value === 'True') {
      return 'Drafted';
    }
    return 'Updated';
  };

  const getActionColor = (log) => {
    if (log.field_name === 'is_active' && log.new_value === 'True') return '#10b981';
    if (log.field_name === 'is_active' && log.new_value === 'False') return '#ef4444';
    if (log.field_name === 'is_draft' && log.new_value === 'False') return '#3b82f6';
    return '#6b7280';
  };

  if (loading) return <div className="full-screen-loader"><div className="spinner"></div><p>Loading audit trail...</p></div>;
  if (error) return <div className="full-screen-loader error-text"><p>{error}</p></div>;

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="tab-header" style={{ marginBottom: '2rem' }}>
            <div>
              <h1>Audit Trail: {prompt_name}</h1>
              <p className="intro-text">
                Lịch sử thay đổi metadata • Activate • Publish • Deactivate
              </p>
            </div>
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              Back
            </button>
          </div>

          {auditLogs.length === 0 ? (
            <div className="project-card" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <h3>No changes recorded yet</h3>
              <p>Metadata của prompt này chưa từng được thay đổi.</p>
            </div>
          ) : (
            <div className="project-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', position: 'sticky', top: 0, zIndex: 1 }}>
                      <th style={{ padding: '1rem', textAlign: 'left', width: '180px' }}>Thời gian</th>
                      <th style={{ padding: '1rem', textAlign: 'left', width: '140px' }}>Người thực hiện</th>
                      <th style={{ padding: '1rem', textAlign: 'left', width: '160px' }}>Trường</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Thay đổi</th>
                      <th style={{ padding: '1rem', textAlign: 'center', width: '120px' }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, idx) => (
                      <tr
                        key={idx}
                        style={{
                          background: idx % 2 === 0 ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                          borderBottom: '1px solid var(--border-color)'
                        }}
                      >
                        <td style={{ padding: '1rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                          {formatDate(log.changed_at)}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ fontWeight: 600, color: '#8b5cf6' }}>{log.changed_by}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span
                            style={{
                              background: getFieldColor(log.field_name),
                              color: 'white',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '999px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            {log.field_name}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', fontFamily: 'monospace' }}>
                          <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>
                            {log.old_value}
                          </span>
                          {' → '}
                          <span style={{ color: '#10b981', fontWeight: 600 }}>
                            {log.new_value}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span
                            style={{
                              background: getActionColor(log),
                              color: 'white',
                              padding: '0.4rem 0.8rem',
                              borderRadius: '999px',
                              fontSize: '0.8rem',
                              fontWeight: 600
                            }}
                          >
                            {getActionLabel(log)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default PromptAuditTrail;