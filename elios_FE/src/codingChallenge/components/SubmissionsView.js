// file: elios_FE/src/codingChallenge/components/SubmissionsView.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../style/SubmissionsView.css"; // <-- NEW CSS FILE
import EditAndShareSolution from "./EditAndShareSolution"; // <-- IMPORT NEW COMPONENT

const SubmissionsView = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [submissionDetails, setSubmissionDetails] = useState(null);

  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  // State for the new "Share Solution" modal
  const [isSharingSolution, setIsSharingSolution] = useState(false);

  // Fetches the list of submissions
  useEffect(() => {
    if (!problemId) return;

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
  }, [problemId]); // Only depends on problemId

  // Fetches details for a single selected submission
  const fetchSubmissionDetails = async (submissionId) => {
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

  const handleSubmissionClick = (submission) => {
    setSelectedSubmission(submission);
    fetchSubmissionDetails(submission.id);
  };

  const closeModal = () => {
    setSelectedSubmission(null);
    setSubmissionDetails(null);
  };

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

  return (
    <>
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
                  <div id="modal-code-header">
                    <h4>Code</h4>
                    {/* Share Solution Button */}
                    <button 
                      id="share-solution-button" 
                      onClick={() => setIsSharingSolution(true)}
                    >
                      Share Solution
                    </button>
                  </div>
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

      {/* Share Solution Modal */}
      {isSharingSolution && submissionDetails && (
          <EditAndShareSolution
            isOpen={isSharingSolution}
            onClose={() => setIsSharingSolution(false)}
            submissionData={submissionDetails.submission.code}
            problemId={problemId}
          />
      )}
    </>
  );
};

export default SubmissionsView;