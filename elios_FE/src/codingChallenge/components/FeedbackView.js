// file: elios_FE/src/codingChallenge/components/FeedbackView.js
import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../style/FeedbackView.css";

const FeedbackView = ({ problemId, currentCode, currentLanguage }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Renamed to feedbackData to indicate it holds the full response object
  const [feedbackData, setFeedbackData] = useState(null);

  const handleAnalyze = async () => {
    if (!currentCode || !currentCode.trim()) {
      setError("Vui lòng nhập mã trước khi yêu cầu phân tích."); // Translated: Please enter code...
      return;
    }

    setLoading(true);
    setError("");
    setFeedbackData(null);

    try {
      const payload = {
        entity_id: problemId,
        input_type: "CODE",
        feedback_input: JSON.stringify({
          code: currentCode,
          language: currentLanguage || "javascript"
        }),
      };

      const response = await axios.post(
        API_ENDPOINTS.AI_FEEDBACK_ANALYZE,
        payload,
        { withCredentials: true }
      );

      if (response.data && response.data.status === "SUCCESS") {
        // Store the FULL response data to access 'result' and 'result_markdown'
        setFeedbackData(response.data);
      } else {
        setError("Không thể phân tích mã. Vui lòng thử lại."); 
      }
    } catch (err) {
      console.error("Error analyzing code:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Bạn không có quyền thực hiện hành động này.");
      } else {
        setError(err.response?.data?.detail || "Đã xảy ra lỗi khi kết nối với AI.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely extract the score from the new nested structure
  const getOverallScore = () => {
    return feedbackData?.result?.overall_assessment?.overall_score ?? "N/A";
  };

  return (
    <div id="feedback-view-container">
      <div id="feedback-header">
        <h3 id="feedback-title">Phân tích AI</h3>
        <p id="feedback-subtitle">
          Nhận phản hồi chi tiết về mã nguồn của bạn từ AI.
        </p>
      </div>

      <div id="feedback-actions">
        <button 
          id="analyze-btn" 
          onClick={handleAnalyze} 
          disabled={loading || !currentCode}
        >
          {loading ? "Đang phân tích..." : "Phân tích mã hiện tại"}
        </button>
      </div>

      {error && <div id="feedback-error">{error}</div>}

      {feedbackData && (
        <div id="feedback-result">
          <div id="feedback-score-card">
            <span id="score-label">Điểm đánh giá:</span>
            {/* Updated to use the helper function for the nested score */}
            <span id="score-value">{getOverallScore()}/100</span>
          </div>
          
          <div id="feedback-content">
            {/* Prioritize rendering result_markdown provided by backend */}
            {feedbackData.result_markdown ? (
               <ReactMarkdown 
                children={feedbackData.result_markdown} 
                remarkPlugins={[remarkGfm]} 
               />
            ) : (
                // Fallback: Dump the result JSON if markdown is missing
                <div className="feedback-json-fallback">
                    <pre>{JSON.stringify(feedbackData.result, null, 2)}</pre>
                </div>
            )}
          </div>
        </div>
      )}
      
      {!feedbackData && !loading && !error && (
        <div id="feedback-empty-state">
            Nhấn nút phía trên để bắt đầu phân tích mã của bạn.
            <br/>
            <small>(Quá trình này có thể mất 3-8 giây)</small>
        </div>
      )}
    </div>
  );
};

export default FeedbackView;