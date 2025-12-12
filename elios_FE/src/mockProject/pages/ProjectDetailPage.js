import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ProjectDetailPage.css';
import ReactMarkdown from 'react-markdown';

const ProjectDetailPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [selectedStep, setSelectedStep] = useState(null);
  const [activeTab, setActiveTab] = useState('guiding');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionClasses, setSubmissionClasses] = useState({});
  const [codeInputs, setCodeInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const userId = localStorage.getItem('userId') || '00000000-0000-0000-0000-000000000000';

  useEffect(() => {
    const fetchData = async () => {
      try {

        const projRes = await axios.get(API_ENDPOINTS.GET_MOCK_PROJECT_DETAIL(projectId), {
          withCredentials: true,
        });
        const currentProject = projRes.data.responseData;
        if (!currentProject) throw new Error('Project not found');
        setProject(currentProject);

        const procRes = await axios.get(API_ENDPOINTS.GET_MOCK_PROJECT_PROCESSES(projectId), {
          withCredentials: true,
        });
        const sorted = procRes.data.responseData.sort((a, b) => a.stepNumber - b.stepNumber);
        setProcesses(sorted);

        const overview = {
          id: 'overview',
          stepNumber: 0,
          stepGuiding: 'Project Overview',
          baseClassCode: null,
          isOverview: true,
        };
        setSelectedStep(overview);

        const subRes = await axios.get(API_ENDPOINTS.GET_SUBMISSIONS_LIST_CURRENT_USER, {
          withCredentials: true,
        });

        const userSub = subRes.data.responseData.find(s => s.mockProjectId === projectId);
        console.log('User submission for this project:', userSub);
        if (userSub) {
          setSubmissionId(userSub.id);
          await fetchSubmissionClassesBySubmission(userSub.id); 
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading project:', err);
        setError('Failed to load project details.');
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  const fetchSubmissionClassesBySubmission = async (subId) => {
    if (!subId) return;
    try {
      const res = await axios.get(API_ENDPOINTS.GET_SUBMISSIONS_CLASSES_BY_SUBMISSION(subId), {
        withCredentials: true,
      });

      const classes = res.data.responseData || [];
      const map = {};
      const codeMap = {};

      classes.forEach(c => {
        map[c.processId] = c;
        codeMap[c.processId] = c.code || '';
      });

      setSubmissionClasses(map);
      setCodeInputs(codeMap);
    } catch (err) {
      console.error('Error fetching submission classes by submission ID:', err);
    }
  };

  const isAllSubmitted = () => {
    return processes.length > 0 &&
      processes.every(proc => {
        const subClass = submissionClasses[proc.id];
        return subClass && subClass.status === 'Submitted';
      });
  };

  const handleStepClick = (step) => {
    setSelectedStep(step);
    setActiveTab('guiding');
  };

  const handleDownload = () => {
    if (project?.baseProjectUrl) {
      const a = document.createElement('a');
      a.href = project.baseProjectUrl;
      a.download = `${project.title.replace(/\s+/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleCodeChange = (processId, value) => {
    setCodeInputs(prev => ({ ...prev, [processId]: value }));
  };

  const handleSubmitAll = async () => {
    let currentSubmissionId = submissionId;

    if (!currentSubmissionId) {
      try {
        const res = await axios.post(
          API_ENDPOINTS.CREATE_SUBMISSION,
          { projectId },
          { withCredentials: true }
        );
        currentSubmissionId = res.data.responseData;
        setSubmissionId(currentSubmissionId);
      } catch (e) {
        alert('Could not create submission. Please try again.');
        return;
      }
    }

    setSubmitting(true);
    try {
      const promises = processes.map(async (proc) => {
        const code = codeInputs[proc.id]?.trim();
        if (!code) return null;

        const payload = {
          processId: proc.id,
          submissionId: currentSubmissionId,
          code,
          status: 'Submitted',
        };
        return axios.post(API_ENDPOINTS.CREATE_SUBMISSIONS_CLASS, payload, { withCredentials: true });
      });

      await Promise.all(promises.filter(Boolean));
      setSubmitSuccess(true);
      alert('Submission successful! Waiting for grading...');
      await fetchSubmissionClassesBySubmission(currentSubmissionId); 
    } catch (e) {
      console.error(e);
      alert('Error while submitting code. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || error) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: '#121212',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#fff',
          fontFamily: '"Fira Code", monospace',
          zIndex: 9999,
        }}
      >
        {loading ? (
          <>
            <div
              style={{
                width: '50px',
                height: '50px',
                border: '5px solid #333',
                borderTop: '5px solid #50fa7b',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '20px',
              }}
            />
            <p style={{ margin: 0, fontSize: '1.1rem', color: '#ccc' }}>
              Loading project...
            </p>
          </>
        ) : (
          <p style={{ margin: 0, fontSize: '1.1rem', color: '#ff6b6b' }}>
            {error}
          </p>
        )}
      </div>
    );
  }

  const overviewStep = { id: 'overview', stepNumber: 0, stepGuiding: 'Project Overview', isOverview: true };
  const submitStep = { id: 'submit', stepNumber: -1, stepGuiding: 'Submit Project', isSubmit: true };

  const allSteps = [overviewStep, ...processes, submitStep];
  const isOverview = selectedStep?.isOverview;
  const isSubmit = selectedStep?.isSubmit;
  const isRegularStep = !isOverview && !isSubmit;

  return (
    <>
      <header></header>

      <main className="project-detail-container">
        {}
        <aside className="steps-sidebar">
          <h3>Navigation</h3>
          <ul className="steps-list">
            {allSteps.map(step => (
              <li
                key={step.id}
                className={`step-item ${selectedStep?.id === step.id ? 'active' : ''}`}
                onClick={() => handleStepClick(step)}
              >
                <span className="step-number">
                  {step.isOverview ? 'Overview' : step.isSubmit ? 'Submit' : `Step ${step.stepNumber}`}
                </span>
                <span className="step-title">
                  {step.isOverview
                    ? 'Introduction & Download'
                    : step.isSubmit
                      ? 'Submit Your Project'
                      : `Guiding Step ${step.stepNumber}`}
                </span>
                {submissionClasses[step.id] && !step.isSubmit && (
                  <span className="submitted-badge">Submitted</span>
                )}
              </li>
            ))}
          </ul>
        </aside>

        {}
        <section className="content-area">
          {selectedStep && (
            <>
              <div className="content-header">
                <h2>
                  {isOverview ? 'Project Overview' :
                    isSubmit ? 'Submit Project' :
                      `Step ${selectedStep.stepNumber}`}
                </h2>
                <div className="header-actions">
                  {isOverview && project?.baseProjectUrl && (
                    <button className="download-btn" onClick={handleDownload}>
                      Download Project (.zip)
                    </button>
                  )}
                  <button className="back-btn" onClick={() => navigate(-1)}>
                    Back to Projects
                  </button>
                </div>
              </div>

              {}
              {isRegularStep && (
                <div className="tabs">
                  <button
                    className={`tab ${activeTab === 'guiding' ? 'active' : ''}`}
                    onClick={() => setActiveTab('guiding')}
                  >
                    Guiding
                  </button>
                  <button
                    className={`tab ${activeTab === 'basecode' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basecode')}
                  >
                    Example Code
                  </button>
                </div>
              )}

              {}
              <div className="tab-content">
                {}
                {isOverview && (
                  <div className="overview-content">
                    <h4>Description</h4>
                    <ReactMarkdown>{project.description}</ReactMarkdown>
                    <div className="download-hint">
                      <strong>Start by downloading the base project above.</strong>
                    </div>
                  </div>
                )}

                {}
                {isRegularStep && activeTab === 'guiding' && (
                  <div className="guiding-content">
                    <h4>Instructions</h4>
                    <ReactMarkdown>{selectedStep.stepGuiding}</ReactMarkdown>
                  </div>
                )}

                {}
                {isRegularStep && activeTab === 'basecode' && (
                  <div className="code-content">
                    <pre><code>{selectedStep.baseClassCode}</code></pre>
                  </div>
                )}

                {}
                {isSubmit && (
                  <div className="submission-section">
                    <h4 style={{ color: '#50fa7b', marginBottom: '16px' }}>
                      Submit Your Solution
                    </h4>
                    <p style={{ color: '#ccc', marginBottom: '20px', fontSize: '0.95rem' }}>
                      Paste the <strong>complete code</strong> for each step below. The system will auto-grade after submission.
                    </p>

                    {processes.map(proc => {
                      const subClass = submissionClasses[proc.id];
                      const isSubmitted = !!subClass;
                      const code = codeInputs[proc.id] || '';

                      return (
                        <div
                          key={proc.id}
                          style={{
                            marginBottom: '24px',
                            padding: '16px',
                            background: '#2d2d2d',
                            borderRadius: '8px',
                            border: '1px solid #444',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <strong style={{ color: '#50fa7b' }}>Step {proc.stepNumber}</strong>
                            {isSubmitted && (
                              <span style={{ color: '#50fa7b', fontSize: '0.9rem' }}>
                                Submitted • Grade: {subClass.grade ?? 'Pending'}
                              </span>
                            )}
                          </div>

                          <textarea
                            value={code}
                            onChange={e => handleCodeChange(proc.id, e.target.value)}
                            placeholder={`Paste code for Step ${proc.stepNumber} here...`}
                            disabled={isSubmitted}
                            style={{
                              width: '100%',
                              minHeight: '180px',
                              background: '#1e1e1e',
                              color: '#fff',
                              border: '1px solid #555',
                              borderRadius: '6px',
                              padding: '12px',
                              fontFamily: 'Fira Code, monospace',
                              fontSize: '0.95rem',
                              resize: 'vertical',
                            }}
                          />

                          {subClass?.assessment && (
                            <div style={{
                              marginTop: '8px',
                              padding: '8px',
                              background: '#333',
                              borderRadius: '4px',
                              fontSize: '0.9rem',
                              color: '#ff79c6',
                            }}>
                              <strong>Assessment:</strong> {subClass.assessment}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {}
                    {(() => {
                      const isAllSubmitted = () => {
                        return processes.length > 0 &&
                          processes.every(proc => {
                            const subClass = submissionClasses[proc.id];
                            return subClass && subClass.status === 'Submitted';
                          });
                      };

                      const allSubmitted = isAllSubmitted();

                      return (
                        <button
                          onClick={handleSubmitAll}
                          disabled={
                            submitting ||
                            submitSuccess ||
                            processes.some(p => !codeInputs[p.id]?.trim()) ||
                            allSubmitted
                          }
                          style={{
                            marginTop: '20px',
                            padding: '12px 24px',
                            background: allSubmitted || submitSuccess ? '#444' : '#50fa7b',
                            color: allSubmitted || submitSuccess ? '#aaa' : '#000',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: (allSubmitted || submitting || submitSuccess) ? 'not-allowed' : 'pointer',
                            width: '100%',
                          }}
                        >
                          {submitting
                            ? 'Submitting...'
                            : allSubmitted
                              ? 'Submitted Successfully!'
                              : 'Submit All Steps'}
                        </button>
                      );
                    })()}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
};

export default ProjectDetailPage;