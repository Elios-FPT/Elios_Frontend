// src/resourceManager/pages/EditProjectProcesses.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const EditProjectProcesses = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();

  const [processes, setProcesses] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [newProcess, setNewProcess] = useState({ stepNumber: '', stepGuiding: '', baseClassCode: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, procRes] = await Promise.all([
          axios.get(API_ENDPOINTS.GET_MOCK_PROJECT_DETAIL(projectId), { withCredentials: true }),
          axios.get(API_ENDPOINTS.GET_MOCK_PROJECT_PROCESSES(projectId), { withCredentials: true })
        ]);

        if (projRes.data.status === 200) {
          setProjectTitle(projRes.data.responseData.title);
        }
        if (procRes.data.status === 200) {
          setProcesses(procRes.data.responseData || []);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const handleAdd = async () => {
    if (!newProcess.stepNumber || !newProcess.stepGuiding) {
      return alert('Step number and guiding are required');
    }

    try {
      const res = await axios.post(
        API_ENDPOINTS.ADD_MOCK_PROJECT_PROCESS(projectId),
        newProcess,
        { withCredentials: true }
      );

      if (res.data.status === 200 && res.data.responseData) {
        const newId = res.data.responseData;
        setProcesses(prev => [...prev, { id: newId, ...newProcess }]);
        setNewProcess({ stepNumber: '', stepGuiding: '', baseClassCode: '' });
        setExpandedId(newId);
      }
    } catch (err) {
      console.error('Add error:', err);
      alert(err.response?.data?.message || 'Failed to add step');
    }
  };

  const handleUpdate = async (id) => {
    const process = processes.find(p => p.id === id);
    if (!process) return;

    try {
      const res = await axios.put(
        API_ENDPOINTS.UPDATE_PROCESS(id),
        process,
        { withCredentials: true }
      );

      if (res.data.status === 200 && res.data.responseData === true) {
        setEditingId(null);
      }
    } catch (err) {
      console.error('Update error:', err);
      alert(err.response?.data?.message || 'Failed to update step');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this step permanently?')) return;

    try {
      const res = await axios.delete(
        API_ENDPOINTS.DELETE_PROCESS(id),
        { withCredentials: true }
      );

      if (res.data.status === 200 && res.data.responseData === true) {
        setProcesses(prev => prev.filter(p => p.id !== id));
        if (expandedId === id) setExpandedId(null);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete step');
    }
  };

  const updateField = (id, field, value) => {
    setProcesses(prev =>
      prev.map(p => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p>Loading steps...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-screen-loader">
        <p className="error-text">{error}</p>
        <button className="btn-success" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <h1>Steps: {projectTitle || 'Loading...'}</h1>
            <p className="intro-text">Click on a step to expand/collapse. Live preview for guiding.</p>
            <button
              className="btn-cancel"
              onClick={() => navigate(`/manage-project-bank/edit/${projectId}`)}
            >
              Back to Project
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Add New Step with Live Preview */}
            <div
              className="form-section"
              style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                background: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #444'
              }}
            >
              <h3 style={{ margin: '0 0 1rem', color: '#4ade80', fontSize: '1.1rem' }}>
                Add New Step
              </h3>

              {/* Step Number */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Step #</label>
                <input
                  type="number"
                  placeholder="Step #"
                  value={newProcess.stepNumber}
                  onChange={e => setNewProcess(p => ({ ...p, stepNumber: e.target.value }))}
                  className="form-input"
                  min="1"
                />
              </div>

              {/* Guiding with Side-by-Side Edit + Preview */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Guiding (Markdown)</label>
                <p className="intro-text" style={{ fontSize: '0.85rem', margin: '0.5rem 0', color: '#aaa' }}>
                  Edit on the left, live preview on the right.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <textarea
                    placeholder="Enter guiding in Markdown..."
                    value={newProcess.stepGuiding}
                    onChange={e => setNewProcess(p => ({ ...p, stepGuiding: e.target.value }))}
                    className="form-textarea"
                    style={{ minHeight: '180px', fontFamily: 'monospace' }}
                  />
                  <div
                    className="markdown-preview"
                    style={{
                      background: '#1a1a1a',
                      padding: '1rem',
                      borderRadius: '8px',
                      minHeight: '180px',
                      overflowY: 'auto',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      color: '#e0e0e0'
                    }}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {newProcess.stepGuiding || '*No guiding yet. Start typing...*'}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>

              {/* Base Class Code */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Base Class Code (Optional)</label>
                <textarea
                  placeholder="Paste base class code here..."
                  value={newProcess.baseClassCode}
                  onChange={e => setNewProcess(p => ({ ...p, baseClassCode: e.target.value }))}
                  className="form-textarea"
                  style={{ minHeight: '140px', fontFamily: 'monospace' }}
                />
              </div>

              <button
                type="button"
                className="btn-success"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                onClick={handleAdd}
              >
                <FiPlus /> Add Step
              </button>
            </div>

            {/* Collapsible Steps List */}
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {processes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#aaa', fontStyle: 'italic' }}>
                  No steps yet. Add one above.
                </p>
              ) : (
                processes
                  .sort((a, b) => a.stepNumber - b.stepNumber)
                  .map(p => (
                    <div
                      key={p.id}
                      style={{
                        border: '1px solid #444',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#2a2a2a',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {/* Header */}
                      <div
                        onClick={() => toggleExpand(p.id)}
                        style={{
                          padding: '0.75rem 1rem',
                          background: '#333',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          userSelect: 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#4ade80', fontWeight: 'bold' }}>
                            {expandedId === p.id ? <FiChevronUp /> : <FiChevronDown />}
                          </span>
                          <strong style={{ color: '#4ade80', fontSize: '1.1rem' }}>
                            Step {p.stepNumber}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }} onClick={e => e.stopPropagation()}>
                          {editingId === p.id ? (
                            <>
                              <button
                                className="btn-icon"
                                onClick={() => handleUpdate(p.id)}
                                style={{ background: '#4ade80', color: '#000', borderRadius: '8px', padding: '0.5rem' }}
                                title="Save"
                              >
                                <FiSave size={16} />
                              </button>
                              <button
                                className="btn-icon danger"
                                onClick={() => setEditingId(null)}
                                style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: '8px', padding: '0.5rem' }}
                                title="Cancel"
                              >
                                <FiX size={16} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="btn-icon"
                                onClick={() => setEditingId(p.id)}
                                style={{ background: '#3399ff', color: '#fff', borderRadius: '8px', padding: '0.5rem' }}
                                title="Edit"
                              >
                                <FiEdit2 size={16} />
                              </button>
                              <button
                                className="btn-icon danger"
                                onClick={() => handleDelete(p.id)}
                                style={{ background: 'transparent', color: '#ff6b6b', border: '1px solid #ff6b6b', borderRadius: '8px', padding: '0.5rem' }}
                                title="Delete"
                              >
                                <FiTrash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      {expandedId === p.id && (
                        <div style={{ padding: '1rem', borderTop: '1px solid #444', background: '#1e1e1e' }}>
                          {/* Step Number */}
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Step Number</label>
                            <input
                              type="number"
                              value={p.stepNumber}
                              onChange={e => updateField(p.id, 'stepNumber', parseInt(e.target.value) || 0)}
                              disabled={editingId !== p.id}
                              className="form-input"
                              min="1"
                            />
                          </div>

                          {/* Guiding with Live Preview */}
                          <div className="form-group" style={{ marginBottom: '1rem' }}>
                            <label>Guiding (Markdown)</label>
                            {editingId === p.id ? (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <textarea
                                  value={p.stepGuiding}
                                  onChange={e => updateField(p.id, 'stepGuiding', e.target.value)}
                                  className="form-textarea"
                                  style={{ minHeight: '160px', fontFamily: 'monospace' }}
                                />
                                <div
                                  className="markdown-preview"
                                  style={{
                                    background: '#1a1a1a',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    minHeight: '160px',
                                    overflowY: 'auto',
                                    fontSize: '0.9rem',
                                    lineHeight: '1.5'
                                  }}
                                >
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {p.stepGuiding || '*No guiding provided.*'}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            ) : (
                              <div
                                className="markdown-preview"
                                style={{
                                  background: '#1a1a1a',
                                  padding: '1rem',
                                  borderRadius: '8px',
                                  minHeight: '80px',
                                  fontSize: '0.9rem',
                                  lineHeight: '1.5'
                                }}
                              >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                  {p.stepGuiding || '*No guiding provided.*'}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>

                          {/* Base Class Code */}
                          <div className="form-group">
                            <label>Base Class Code</label>
                            <textarea
                              value={p.baseClassCode || ''}
                              onChange={e => updateField(p.id, 'baseClassCode', e.target.value)}
                              disabled={editingId !== p.id}
                              className="form-textarea"
                              style={{
                                minHeight: '140px',
                                fontFamily: 'monospace',
                                fontSize: '0.9rem',
                                background: editingId === p.id ? '#1a1a1a' : '#222',
                                color: editingId === p.id ? '#fff' : '#ccc'
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default EditProjectProcesses;