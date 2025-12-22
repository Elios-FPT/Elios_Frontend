// file: elios_FE/src/codingChallenge/components/FeedbackView.js
import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../style/FeedbackView.css";

// UPDATED: Added problemDescription to props
const FeedbackView = ({ problemId, currentCode, currentLanguage, problemDescription }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackData, setFeedbackData] = useState(null);

  const handleAnalyze = async () => {
    if (!currentCode || !currentCode.trim()) {
      setError("Vui lòng nhập mã trước khi yêu cầu phân tích."); 
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
          language: currentLanguage || "javascript",
          user_code_solution: currentCode,
          problem_description: problemDescription || "No description provided", // UPDATED: Use prop here
        }),
      };

      const response = await axios.post(
        API_ENDPOINTS.AI_FEEDBACK_ANALYZE,
        payload,
        { withCredentials: true }
      );

      if (response.data && response.data.status === "SUCCESS") {
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

  const getOverallScore = () => {
    return feedbackData?.result?.overall_assessment?.overall_score ?? "N/A";
  };

  return (
    <div id="feedback-view-container">
      <div id="feedback-header">
        {/* <h3 id="feedback-title">Phân tích AI</h3> */}
        <p id="feedback-subtitle">
          Nhận phản hồi về code của bạn từ AI.
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
            <span id="score-value">{getOverallScore()}/100</span>
          </div>
          
          <div id="feedback-content">
            {feedbackData.result_markdown ? (
               <ReactMarkdown 
                children={feedbackData.result_markdown} 
                remarkPlugins={[remarkGfm]} 
               />
            ) : (
                <div className="feedback-json-fallback">
                    <pre>{JSON.stringify(feedbackData.result, null, 2)}</pre>
                </div>
            )}
          </div>
        </div>
      )}
      
      {!feedbackData && !loading && !error && (
        <div id="feedback-empty-state">
            Nhấn nút phía trên để bắt đầu. Sẽ tiêu hao <span style={{ color: "#07a865", fontWeight: "bold" }}>1000 tokens</span>
        </div>
      )}
    </div>
  );
};

export default FeedbackView;