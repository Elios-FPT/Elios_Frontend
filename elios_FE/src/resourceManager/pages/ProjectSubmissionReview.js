// src/resourceManager/pages/ProjectSubmissionReview.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp, FiCheckCircle, FiEdit3, FiCode, FiStar, FiUser } from 'react-icons/fi';

const ProjectSubmissionReview = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [projectTitle, setProjectTitle] = useState('');
  const [processes, setProcesses] = useState({});
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSubmission, setExpandedSubmission] = useState(null);
  const [expandedClass, setExpandedClass] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [reviewData, setReviewData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchProcess = useCallback(async (processId) => {
    if (processes[processId]) return processes[processId];
    try {
      const res = await axios.get(API_ENDPOINTS.GET_PROCESS_DETAIL(processId), { withCredentials: true });
      if (res.data.status === 200 && res.data.responseData) {
        const process = res.data.responseData;
        setProcesses(prev => ({ ...prev, [processId]: process }));
        return process;
      }
    } catch (err) {
      console.warn(`Failed to load process ${processId}`, err);
    }
    return null;
  }, [processes]);

  const fetchUser = useCallback(async (userId) => {
    if (users[userId]) return users[userId];
    try {
      const res = await axios.get(API_ENDPOINTS.GET_USER_BY_ID(userId), { withCredentials: true });
      if (res.data.status === 200 && res.data.data) {
        const user = res.data.data;
        const userInfo = {
          fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || userId,
          avatarUrl: user.avatarUrl || null
        };
        setUsers(prev => ({ ...prev, [userId]: userInfo }));
        return userInfo;
      }
    } catch (err) {
      console.warn(`Failed to load user ${userId}`, err);
    }
    return { fullName: userId, avatarUrl: null };
  }, [users]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const projRes = await axios.get(API_ENDPOINTS.GET_MOCK_PROJECT_DETAIL(projectId), { withCredentials: true });
        if (projRes.data.status !== 200 || !projRes.data.responseData) {
          throw new Error(projRes.data.message || 'Failed to load project');
        }
        setProjectTitle(projRes.data.responseData.title);

        const subRes = await axios.get(API_ENDPOINTS.GET_SUBMISSIONS_LIST, {
          params: { ProjectId: projectId },
          withCredentials: true
        });
        if (subRes.data.status !== 200 || !subRes.data.responseData) {
          throw new Error(subRes.data.message || 'Failed to load submissions');
        }

        const subs = subRes.data.responseData;

        const subsWithClasses = await Promise.all(
          subs.map(async (sub) => {
            try {
              const classRes = await axios.get(API_ENDPOINTS.GET_SUBMISSIONS_CLASSES_BY_SUBMISSION(sub.id), { withCredentials: true });
              if (classRes.data.status === 200 && classRes.data.responseData) {
                const classes = classRes.data.responseData;
                await Promise.all(classes.map(cls => fetchProcess(cls.processId)));
                await fetchUser(sub.userId);
                return { ...sub, classes };
              }
            } catch (err) {
              console.warn(`Failed to load classes for submission ${sub.id}`, err);
            }
            return { ...sub, classes: [] };
          })
        );

        setSubmissions(subsWithClasses);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, fetchProcess, fetchUser]);

  const toggleSubmission = (id) => {
    setExpandedSubmission(prev => (prev === id ? null : id));
    setExpandedClass(null);
  };

  const toggleClass = (classId) => {
    setExpandedClass(prev => (prev === classId ? null : classId));
  };

  const handleReviewChange = (classId, field, value) => {
    setReviewData(prev => ({
      ...prev,
      [classId]: { ...prev[classId], [field]: value }
    }));
  };

  // CHO PHÉP SỬA LẠI KHI ĐÃ REVIEWED
  const handleSubmitClassReview = async (classId, submissionId, userCode) => {
    const data = reviewData[classId];
    if (!data || data.score === undefined || !data.feedback?.trim()) {
      return alert('Please provide score and feedback');
    }

    const grade = Math.round(parseFloat(data.score)); // Số nguyên

    try {
      const res = await axios.put(
        API_ENDPOINTS.UPDATE_SUBMISSIONS_CLASS(classId),
        {
          code: userCode,
          grade,
          assessment: data.feedback,
          status: 'Reviewed'
        },
        { withCredentials: true }
      );

      if (res.data.status === 200 && res.data.responseData === true) {
        setSubmissions(prev =>
          prev.map(sub =>
            sub.id === submissionId
              ? {
                  ...sub,
                  classes: sub.classes.map(cls =>
                    cls.id === classId
                      ? { ...cls, grade, assessment: data.feedback, status: 'Reviewed' }
                      : cls
                  )
                }
              : sub
          )
        );

        await recalculateFinalGrade(submissionId);

        setEditingClass(null);
        setReviewData(prev => ({ ...prev, [classId]: undefined }));
        alert('Review updated successfully');
      }
    } catch (err) {
      console.error('Review error:', err);
      alert(err.response?.data?.message || 'Failed to save review');
    }
  };

  // TÍNH FINAL GRADE → SỐ NGUYÊN
  const recalculateFinalGrade = async (submissionId) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission || !submission.classes.length) return;

    const reviewedClasses = submission.classes
      .filter(c => c.status === 'Reviewed' && c.grade !== null && c.grade !== undefined);

    if (reviewedClasses.length === 0) return;

    const sum = reviewedClasses.reduce((acc, c) => acc + parseFloat(c.grade), 0);
    const avg = sum / reviewedClasses.length;
    const finalGrade = Math.floor(avg); // SỐ NGUYÊN

    try {
      await axios.put(
        API_ENDPOINTS.UPDATE_SUBMISSION(submissionId),
        { finalGrade },
        { withCredentials: true }
      );

      setSubmissions(prev =>
        prev.map(s =>
          s.id === submissionId ? { ...s, finalGrade } : s
        )
      );
    } catch (err) {
      console.warn('Failed to update final grade', err);
    }
  };

  const filteredSubmissions = submissions
    .filter(s => {
      const user = users[s.userId] || {};
      const matchesSearch = (user.fullName || s.userId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.id.toString().includes(searchTerm);
      const matchesStatus = filterStatus === 'all' || s.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p style={{ color: '#BBBBBB' }}>Loading submissions and profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="full-screen-loader">
        <p className="error-text">{error}</p>
        <button className="btn-success" onClick={() => navigate('/manage-project-bank')}>
          Back to Projects
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
            <h1 style={{ color: '#FFFFFF' }}>Review Submissions: {projectTitle}</h1>
            <p className="intro-text" style={{ color: '#BBBBBB' }}>
              Review each step. Final score is auto-calculated (integer). You can edit reviewed steps.
            </p>
            <button className="btn-cancel" onClick={() => navigate('/manage-project-bank')}>
              Back to Projects
            </button>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Filters */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label style={{ color: '#BBBBBB', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiSearch /> Search by Name or ID
                </label>
                <input
                  type="text"
                  placeholder="Enter name or user ID..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="form-input"
                  style={{ color: '#BBBBBB', background: '#2a2a2a', borderColor: '#444' }}
                />
              </div>
              <div className="form-group">
                <label style={{ color: '#BBBBBB', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiFilter /> Filter by Status
                </label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="form-select"
                  style={{ color: '#BBBBBB', background: '#2a2a2a', borderColor: '#444' }}
                >
                  <option value="all">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Reviewed">Reviewed</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
            </div>

            {/* Submissions */}
            <div style={{ display: 'grid', gap: '1rem' }}>
              {filteredSubmissions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#BBBBBB', fontStyle: 'italic' }}>
                  No submissions found.
                </p>
              ) : (
                filteredSubmissions.map(sub => {
                  const user = users[sub.userId] || { fullName: sub.userId, avatarUrl: null };
                  const reviewedCount = sub.classes.filter(c => c.status === 'Reviewed').length;
                  const totalCount = sub.classes.length;
                  const progress = totalCount > 0 ? (reviewedCount / totalCount) * 100 : 0;

                  const sortedClasses = [...sub.classes].sort((a, b) => {
                    const stepA = processes[a.processId]?.stepNumber || 999;
                    const stepB = processes[b.processId]?.stepNumber || 999;
                    return stepA - stepB;
                  });

                  return (
                    <div key={sub.id} style={{ border: '1px solid #444', borderRadius: '12px', overflow: 'hidden', background: '#2a2a2a' }}>
                      <div
                        onClick={() => toggleSubmission(sub.id)}
                        style={{
                          padding: '0.75rem 1rem',
                          background: '#333',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ color: '#4ade80' }}>
                            {expandedSubmission === sub.id ? <FiChevronUp /> : <FiChevronDown />}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.fullName}
                                style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                              />
                            ) : null}
                            <div style={{
                              width: 32, height: 32, borderRadius: '50%',
                              background: '#444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              display: user.avatarUrl ? 'none' : 'flex'
                            }}>
                              <FiUser style={{ color: '#BBBBBB', fontSize: 16 }} />
                            </div>
                            <div>
                              <strong style={{ color: '#4ade80' }}>{user.fullName}</strong>
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#BBBBBB' }}>
                                #{sub.id.slice(0, 8)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ fontSize: '0.8rem', color: '#BBBBBB' }}>
                            <span>{reviewedCount}/{totalCount} steps</span>
                            <div style={{ width: 60, height: 6, background: '#444', borderRadius: 3, marginTop: 4 }}>
                              <div style={{ width: `${progress}%`, height: '100%', background: '#4ade80', borderRadius: 3 }}></div>
                            </div>
                          </div>
                          {sub.finalGrade !== null && (
                            <span style={{ color: '#4ade80', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <FiStar /> {sub.finalGrade}
                            </span>
                          )}
                        </div>
                      </div>

                      {expandedSubmission === sub.id && (
                        <div style={{ padding: '1rem', background: '#1e1e1e', borderTop: '1px solid #444' }}>
                          {sortedClasses.length === 0 ? (
                            <p style={{ color: '#BBBBBB', fontStyle: 'italic' }}>No steps submitted.</p>
                          ) : (
                            sortedClasses.map(cls => {
                              const process = processes[cls.processId];
                              const stepNumber = process?.stepNumber || '?';
                              const stepTitle = process?.stepGuiding?.split('\n')[0]?.replace(/^##\s*/, '') || `Step ${stepNumber}`;

                              return (
                                <div
                                  key={cls.id}
                                  style={{
                                    border: '1px solid #444',
                                    borderRadius: '8px',
                                    marginBottom: '0.75rem',
                                    overflow: 'hidden',
                                    background: '#222'
                                  }}
                                >
                                  <div
                                    onClick={() => toggleClass(cls.id)}
                                    style={{
                                      padding: '0.5rem 0.75rem',
                                      background: '#2a2a2a',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                      <FiCode style={{ color: '#4ade80' }} />
                                      <span style={{ color: '#BBBBBB' }}>
                                        <strong>{stepTitle}</strong>
                                      </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <span style={{
                                        padding: '0.2rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        background: cls.status === 'Reviewed' ? '#1e3a1e' : '#3a2a1e',
                                        color: cls.status === 'Reviewed' ? '#4ade80' : '#f59e0b'
                                      }}>
                                        {cls.status || 'Pending'}
                                      </span>
                                      {cls.grade !== null && (
                                        <span style={{ color: '#4ade80', fontWeight: 'bold' }}>
                                          {cls.grade}/100
                                        </span>
                                      )}
                                      {expandedClass === cls.id ? <FiChevronUp style={{ color: '#BBBBBB' }} /> : <FiChevronDown style={{ color: '#BBBBBB' }} />}
                                    </div>
                                  </div>

                                  {expandedClass === cls.id && (
                                    <div style={{ padding: '1rem' }}>
                                      {process?.stepGuiding && (
                                        <div style={{ marginBottom: '1rem', background: '#1a1a1a', padding: '1rem', borderRadius: '8px', border: '1px solid #444' }}>
                                          <p style={{ color: '#BBBBBB', margin: '0 0 0.5rem', fontWeight: 'bold' }}>
                                            Guiding Step {stepNumber}
                                          </p>
                                          <div className="markdown-preview" style={{ color: '#BBBBBB', fontSize: '0.9rem' }}>
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                              {process.stepGuiding}
                                            </ReactMarkdown>
                                          </div>
                                        </div>
                                      )}

                                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                                        <label style={{ color: '#BBBBBB' }}>User Code</label>
                                        <pre style={{
                                          background: '#111',
                                          padding: '1rem',
                                          borderRadius: '8px',
                                          overflowX: 'auto',
                                          fontSize: '0.85rem',
                                          maxHeight: '250px',
                                          color: '#BBBBBB'
                                        }}>
                                          <code>{cls.code || '// No code submitted'}</code>
                                        </pre>
                                      </div>

                                      {/* CHO PHÉP SỬA LẠI KHI ĐÃ REVIEWED */}
                                      <div style={{ border: '1px dashed #444', padding: '1rem', borderRadius: '8px' }}>
                                        {editingClass === cls.id ? (
                                          <>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', marginBottom: '1rem' }}>
                                              <div>
                                                <label style={{ color: '#BBBBBB' }}>Score (0–100)</label>
                                                <input
                                                  type="number"
                                                  min="0"
                                                  max="100"
                                                  value={reviewData[cls.id]?.score ?? cls.grade ?? ''}
                                                  onChange={e => handleReviewChange(cls.id, 'score', e.target.value)}
                                                  className="form-input"
                                                  style={{ color: '#BBBBBB' }}
                                                />
                                              </div>
                                              <div>
                                                <label style={{ color: '#BBBBBB' }}>Feedback (Markdown)</label>
                                                <textarea
                                                  value={reviewData[cls.id]?.feedback ?? cls.assessment ?? ''}
                                                  onChange={e => handleReviewChange(cls.id, 'feedback', e.target.value)}
                                                  className="form-textarea"
                                                  style={{ minHeight: '100px', color: '#BBBBBB' }}
                                                  placeholder="Great job! Consider..."
                                                />
                                              </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                              <button
                                                className="btn-success"
                                                onClick={() => handleSubmitClassReview(cls.id, sub.id, cls.code)}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                              >
                                                <FiCheckCircle /> {cls.status === 'Reviewed' ? 'Update Review' : 'Save Review'}
                                              </button>
                                              <button className="btn-cancel" onClick={() => setEditingClass(null)}>
                                                Cancel
                                              </button>
                                            </div>
                                          </>
                                        ) : (
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            {cls.status === 'Reviewed' ? (
                                              <div style={{ flex: 1 }}>
                                                <p style={{ color: '#BBBBBB' }}><strong>Score:</strong> {cls.grade}/100</p>
                                                <p style={{ color: '#BBBBBB' }}><strong>Feedback:</strong></p>
                                                <div className="markdown-preview" style={{ color: '#BBBBBB' }}>
                                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {cls.assessment || '*No feedback.*'}
                                                  </ReactMarkdown>
                                                </div>
                                              </div>
                                            ) : (
                                              <div style={{ flex: 1 }}>
                                                <p style={{ color: '#BBBBBB', fontStyle: 'italic' }}>Not reviewed yet.</p>
                                              </div>
                                            )}
                                            <button
                                              className="btn-success"
                                              onClick={() => {
                                                setEditingClass(cls.id);
                                                setReviewData(prev => ({
                                                  ...prev,
                                                  [cls.id]: {
                                                    score: cls.grade ?? '',
                                                    feedback: cls.assessment ?? ''
                                                  }
                                                }));
                                              }}
                                              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                              <FiEdit3 /> {cls.status === 'Reviewed' ? 'Edit Review' : 'Review Step'}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ProjectSubmissionReview;