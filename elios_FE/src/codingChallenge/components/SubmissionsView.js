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
        setSubmissionError("Không thể tải lịch sử nộp bài."); // Translated
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
      setSubmissionError("Không thể tải chi tiết bài nộp."); // Translated
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
      return submission.failedTestCaseId ? "Thất bại" : "Chấp nhận"; // Translated
    }
    return "Đang xử lý"; // Translated
  };

  return (
    <>
      <div>
        {submissionLoading && <div id="loading-message">Đang tải danh sách bài nộp...</div>} {/* Translated */}
        {submissionError && <div id="error-message">{submissionError}</div>}
        {!submissionLoading && !submissionError && submissions.length === 0 && (
          <p>Không tìm thấy bài nộp nào cho vấn đề này.</p> // Translated
        )}
        {!submissionLoading && submissions.length > 0 && (
          <table id="submission-table">
            <thead>
              <tr>
                <th>Thời gian nộp</th> {/* Translated */}
                <th>Trạng thái</th> {/* Translated */}
                <th>Ngôn ngữ</th> {/* Translated */}
                <th>Thời gian chạy</th> {/* Translated */}
                <th>Bộ nhớ</th> {/* Translated */}
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
                Chi tiết bài nộp - {new Date(selectedSubmission.submittedAt).toLocaleString()} {/* Translated */}
              </h3>
              <button id="modal-close-button" onClick={closeModal}>✕</button>
            </div>
            {submissionDetails ? (
              <>
                <div id="modal-section">
                  <div id="modal-code-header">
                    <h4>Mã nguồn</h4> {/* Translated */}
                    {/* Share Solution Button */}
                    <button 
                      id="share-solution-button" 
                      onClick={() => setIsSharingSolution(true)}
                    >
                      Chia sẻ giải pháp {/* Translated */}
                    </button>
                  </div>
                  <pre className="code-block">
                    <code>{submissionDetails.submission.code}</code>
                  </pre>
                </div>
                <div id="modal-section">
                  <h4>Tổng quan</h4> {/* Translated */}
                  <p>Trạng thái: <span className={submissionDetails.summary.overallStatus === "PASSED" ? "status-passed" : "status-failed"}>{submissionDetails.summary.overallStatus}</span></p>
                  <p>Tổng số Test Case: {submissionDetails.summary.totalTestCases}</p> {/* Translated */}
                  <p>Đã qua: {submissionDetails.summary.passedTestCases}</p> {/* Translated */}
                </div>
                <div id="modal-section">
                  <h4>Kết quả kiểm thử</h4> {/* Translated */}
                  <table id="modal-table">
                    <thead>
                      <tr>
                        <th>Trạng thái</th> {/* Translated */}
                        <th>Đầu ra</th> {/* Translated */}
                        <th>Thời gian chạy</th> {/* Translated */}
                        <th>Bộ nhớ</th> {/* Translated */}
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
              <div id="loading-message">Đang tải chi tiết bài nộp...</div> // Translated
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