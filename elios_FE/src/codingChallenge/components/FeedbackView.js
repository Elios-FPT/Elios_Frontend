// file: elios_FE/src/codingChallenge/components/FeedbackView.js
import React, { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../style/FeedbackView.css";
import { useNavigate } from "react-router-dom"; // <--- Import useNavigate
import { FaCoins } from "react-icons/fa"; // <--- Import FaCoins icon

const FeedbackView = ({ problemId, currentCode, currentLanguage, problemDescription }) => {
  const navigate = useNavigate(); // <--- Initialize hook
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [feedbackData, setFeedbackData] = useState(null);
  const [isOutOfTokens, setIsOutOfTokens] = useState(false); // <--- New State

  const handleAnalyze = async () => {
    if (!currentCode || !currentCode.trim()) {
      setError("Vui lòng nhập mã trước khi yêu cầu phân tích."); 
      return;
    }

    setLoading(true);
    setError("");
    setIsOutOfTokens(false); // Reset token state
    setFeedbackData(null);

    try {
      const payload = {
        entity_id: problemId,
        input_type: "CODE",
        feedback_input: JSON.stringify({
          language: currentLanguage || "java",
          user_code_solution: currentCode,
          problem_description: problemDescription || "No description provided",
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
      
      const errorDetail = err.response?.data?.detail || "";

      // --- SPECIFIC ERROR HANDLING ---
      // Check for "insufficient balance" in the error detail (works for status 400 or 500)
      if (errorDetail.toLowerCase().includes("insufficient balance")) {
        setIsOutOfTokens(true);
      } 
      else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Bạn không có quyền thực hiện hành động này.");
      } else {
        setError(errorDetail || "Đã xảy ra lỗi khi kết nối với AI.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getOverallScore = () => {
    return feedbackData?.result?.overall_assessment?.overall_score ?? "N/A";
  };

  const handleGoToProfile = () => {
    navigate('/user/profile');
  };

  return (
    <div id="feedback-view-container">
      <div id="feedback-header">
        <p id="feedback-subtitle">
          Nhận phản hồi về code của bạn từ AI.
        </p>
      </div>

      {/* --- OUT OF TOKENS NOTIFICATION --- */}
      {isOutOfTokens ? (
        <div className="feedback-error-state" style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeeba', 
            borderRadius: '8px', 
            padding: '20px', 
            textAlign: 'center', 
            marginBottom: '20px',
            color: '#856404'
        }}>
          <div style={{ marginBottom: '10px' }}>
             <FaCoins style={{ fontSize: '40px', color: '#ffc107' }} />
          </div>
          <h4 style={{ color: '#d39e00', margin: '10px 0', fontWeight: 'bold' }}>Hết Token</h4>
          <p style={{ marginBottom: '15px' }}>
            Bạn không đủ token để thực hiện phân tích này (phí 1000 token). 
            Vui lòng nạp thêm để tiếp tục.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
                onClick={handleGoToProfile} 
                style={{ 
                    backgroundColor: '#ffc107', 
                    color: '#000', 
                    border: 'none', 
                    padding: '8px 16px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer' 
                }}
            >
               Nạp ngay
            </button>
            <button 
                onClick={() => setIsOutOfTokens(false)} 
                style={{ 
                    backgroundColor: 'transparent', 
                    color: '#856404', 
                    border: '1px solid #856404', 
                    padding: '8px 16px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold', 
                    cursor: 'pointer' 
                }}
            >
               Hủy
            </button>
          </div>
        </div>
      ) : (
        <div id="feedback-actions">
            <button 
            id="analyze-btn" 
            onClick={handleAnalyze} 
            disabled={loading || !currentCode}
            >
            {loading ? "Đang phân tích..." : "Phân tích mã hiện tại"}
            </button>
        </div>
      )}

      {error && !isOutOfTokens && <div id="feedback-error">{error}</div>}

      {feedbackData && !isOutOfTokens && (
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
      
      {!feedbackData && !loading && !error && !isOutOfTokens && (
        <div id="feedback-empty-state">
            Nhấn nút phía trên để bắt đầu. Sẽ tiêu hao <span style={{ color: "#07a865", fontWeight: "bold" }}>1000 tokens</span>
        </div>
      )}
    </div>
  );
};

export default FeedbackView;