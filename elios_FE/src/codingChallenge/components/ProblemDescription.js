// file: elios_FE/src/codingChallenge/components/ProblemDescription.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../style/ProblemDescription.css";

const ProblemDescription = ({ problemId }) => {
  // --- STATE MANAGEMENT ---
  const [problem, setProblem] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);

  // Loading and Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const [activeTab, setActiveTab] = useState("description");

  // --- API CALLS ---
  // Fetch main problem details
  useEffect(() => {
    if (!problemId) return;

    const fetchProblem = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get(
          API_ENDPOINTS.GET_CODE_CHALLENGE_DETAIL(problemId),
          { withCredentials: true }
        );
        const data = response.data?.data || response.data;
        setProblem(data);
      } catch (err) {
        console.error("Error fetching problem:", err);
        setError("⚠️ Failed to load problem details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [problemId]);

  // Fetch submission history only when the tab is active
  useEffect(() => {
    if (!problemId || activeTab !== "submissions") return;

    const fetchSubmissions = async () => {
      setSubmissionLoading(true);
      setSubmissionError("");
      try {
        const response = await axios.get(
          API_ENDPOINTS.GET_SUBMISSION_HISTORY(problemId),
          { withCredentials: true }
        );
        setSubmissions(response.data?.data || []);
      } catch (err) {
        console.error("Error fetching submission history:", err);
        setSubmissionError("Failed to load submission history.");
      } finally {
        setSubmissionLoading(false);
      }
    };

    fetchSubmissions();
  }, [problemId, activeTab]);

  // Fetch details for a single submission (for modal)
  const fetchSubmissionDetails = async (submissionId) => {
    // Reset previous details
    setSubmissionDetails(null);
    setSubmissionError("");
    try {
      const response = await axios.get(
        API_ENDPOINTS.GET_SUBMISSION_HISTORY_DETAIL(submissionId),
        { withCredentials: true }
      );
      setSubmissionDetails(response.data.data);
    } catch (err) {
      console.error("Error fetching submission details:", err);
      setSubmissionError("Failed to load submission details.");
    }
  };



  // --- HANDLERS ---
  const handleSubmissionClick = (submission) => {
    setSelectedSubmission(submission);
    fetchSubmissionDetails(submission.id);
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setSubmissionDetails(null);
  };

  // --- RENDER LOGIC ---
  const getStatusStyle = (submission) => {
    if (submission.status === "COMPLETED") {
      return submission.failedTestCaseId ? "status-failed" : "status-passed";
    }
    return "status-pending";
  };

  const getStatusText = (submission) => {
    if (submission.status === "COMPLETED") {
      return submission.failedTestCaseId ? "Failed" : "Accepted";
    }
    return "Pending";
  };

  if (loading) return <div id="loading-message">Loading problem...</div>;
  if (error) return <div id="error-message">{error}</div>;
  if (!problem) return null;

  return (
    <div id="problem-description-container">
      {/* Tab Navigation */}
      <div id="tabs-container">
        <button
          id={activeTab === "description" ? "tab-button-active" : "tab-button"}
          onClick={() => setActiveTab("description")}
        >
          Description
        </button>
        <button
          id={activeTab === "submissions" ? "tab-button-active" : "tab-button"}
          onClick={() => setActiveTab("submissions")}
        >
          Submissions
        </button>
      </div>

      {/* Tab Content */}
      <div id="tab-content">
        {activeTab === "description" && (
          <>
            <h2 id="problem-title">{problem.title}</h2>
            <ReactMarkdown
              children={problem.description}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                code: ({ inline, className, children, ...props }) =>
                  !inline ? (
                    <pre className="code-block">
                      <code className={className} {...props}>{children}</code>
                    </pre>
                  ) : (
                    <code className="inline-code" {...props}>{children}</code>
                  ),
              }}
            />
            {problem.exampleInput && problem.exampleOutput && (
              <pre id="example-block">
                {`Input: ${problem.exampleInput}\nOutput: ${problem.exampleOutput}`}
              </pre>
            )}
          </>
        )}

        {activeTab === "submissions" && (
          <div>
            {submissionLoading && <div id="loading-message">Loading submissions...</div>}
            {submissionError && <div id="error-message">{submissionError}</div>}
            {!submissionLoading && !submissionError && submissions.length === 0 && (
              <p>No submissions found for this problem.</p>
            )}
            {!submissionLoading && submissions.length > 0 && (
              <table id="submission-table">
                <thead>
                  <tr>
                    <th>Submitted At</th>
                    <th>Status</th>
                    <th>Language</th>
                    <th>Runtime</th>
                    <th>Memory</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((sub) => (
                    <tr key={sub.id} onClick={() => handleSubmissionClick(sub)}>
                      <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                      <td className={getStatusStyle(sub)}>{getStatusText(sub)}</td>
                      <td>{sub.language}</td>
                      <td>{sub.maxExecutionTime !== null ? `${sub.maxExecutionTime} ms` : "N/A"}</td>
                      <td>{sub.maxMemoryUsage !== null ? `${(sub.maxMemoryUsage / 1024).toFixed(2)} MB` : "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Submission Details Modal */}
      {selectedSubmission && (
        <div id="modal-overlay">
          <div id="modal-content">
            <div id="modal-header">
              <h3 id="modal-title">
                Submission Details - {new Date(selectedSubmission.submittedAt).toLocaleString()}
              </h3>
              <button id="modal-close-button" onClick={closeModal}>✕</button>
            </div>
            {submissionDetails ? (
              <>
                <div id="modal-section">
                  <h4>Code</h4>
                  <pre className="code-block">
                    <code>{submissionDetails.submission.code}</code>
                  </pre>
                </div>
                <div id="modal-section">
                  <h4>Summary</h4>
                  <p>Status: <span className={submissionDetails.summary.overallStatus === "PASSED" ? "status-passed" : "status-failed"}>{submissionDetails.summary.overallStatus}</span></p>
                  <p>Total Test Cases: {submissionDetails.summary.totalTestCases}</p>
                  <p>Passed: {submissionDetails.summary.passedTestCases}</p>
                </div>
                <div id="modal-section">
                  <h4>Test Case Results</h4>
                  <table id="modal-table">
                    <thead>
                      <tr>
                        <th>Status</th>
                        <th>Output</th>
                        <th>Runtime</th>
                        <th>Memory</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissionDetails.evaluationResults.map((result) => (
                        <tr key={result.id}>
                          <td className={result.status === "PASSED" ? "status-passed" : "status-failed"}>{result.status}</td>
                          <td><pre>{result.actualOutput || "N/A"}</pre></td>
                          <td>{result.executionTime} ms</td>
                          <td>{(result.memoryUsage / 1024).toFixed(2)} MB</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : submissionError ? (
              <div id="error-message">{submissionError}</div>
            ) : (
              <div id="loading-message">Loading submission details...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemDescription;