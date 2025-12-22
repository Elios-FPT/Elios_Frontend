// file: elios_FE/src/resumeBuilder/components/CVFeedbackView.js
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FaMagic,
  FaCheckCircle,
  FaExclamationCircle,
  FaRobot,
  FaCoins,
  FaHourglassHalf // <--- Import Hourglass icon
} from 'react-icons/fa';
import { Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/CVFeedbackView.css';

const CVFeedbackView = ({ resumeData, resumeId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [error, setError] = useState(null);
  const [isOutOfTokens, setIsOutOfTokens] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false); // <--- New State for Timeout

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setFeedbackData(null);
    setIsOutOfTokens(false);
    setIsTimeout(false); // <--- Reset timeout state

    try {
      const payload = {
        entity_id: resumeId,
        input_type: "CV",
        feedback_input: JSON.stringify(resumeData),
      };

      const response = await axios.post(
        API_ENDPOINTS.AI_FEEDBACK_ANALYZE,
        payload,
        {
          withCredentials: true,
          timeout: 35000
        }
      );

      if (response.data && response.data.status === 'SUCCESS') {
        setFeedbackData(response.data);
      } else {
        setError('Không thể phân tích CV. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);

      const errorDetail = err.response?.data?.detail || err.response?.data?.message || "";

      if (err.code === 'ECONNABORTED' || err.message.toLowerCase().includes('timeout') || err.response?.status === 504) {
        setIsTimeout(true);
      }
      else if (errorDetail.toLowerCase().includes("insufficient balance")) {
        setIsOutOfTokens(true);
      }
      else {
        setError('Đã xảy ra lỗi khi kết nối với trợ lý AI.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToProfile = () => {
    navigate('/user/profile');
  };

  return (
    <div className="cv-feedback-container">
      {/* Empty State */}
      {!feedbackData && !loading && !error && !isOutOfTokens && !isTimeout && (
        <div className="feedback-empty-state">
          <div className="feedback-icon-wrapper">
            <FaRobot className="feedback-mascot" />
          </div>
          <h3>Sử dụng đánh giá CV</h3>
          <p>
            Tôi có thể đánh giá CV của bạn để đưa ra gợi ý nhằm cải thiện, nhưng quyết định cuối cùng vẫn thuộc về bạn.
            Nhấn bên dưới để nhận phản hồi ngay!
            Chi phí thực hiện là <span style={{ color: "#07a865", fontWeight: "bold" }}>1000 tokens</span>
          </p>
          <button className="feedback-btn-primary" onClick={handleAnalyze}>
            <FaMagic style={{ marginRight: '8px' }} /> Phân tích CV ngay
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="feedback-loading-state">
          <Spinner animation="border" variant="success" />
          <p>Đang đọc CV của bạn...</p>
          <small>Đang tìm từ khóa, định dạng và đánh giá độ hiệu quả...</small>
        </div>
      )}

      {/* --- TIMEOUT NOTIFICATION --- */}
      {isTimeout && (
        <div className="feedback-error-state">
          <div className="feedback-icon-wrapper" style={{ backgroundColor: '#fff8e1' }}>
            <FaHourglassHalf style={{ fontSize: '40px', color: '#fbc02d' }} />
          </div>
          <h3 style={{ color: '#f57f17', marginTop: '10px' }}>Yêu cầu quá thời gian</h3>
          <p>
            AI đang mất nhiều thời gian hơn dự kiến để phản hồi. Có thể do máy chủ đang quá tải.
          </p>
          <button className="feedback-btn-secondary" onClick={handleAnalyze} style={{ color: '#f57f17', borderColor: '#fbc02d' }}>
            Thử lại
          </button>
        </div>
      )}

      {/* --- OUT OF TOKENS NOTIFICATION --- */}
      {isOutOfTokens && (
        <div className="feedback-error-state">
          <div className="feedback-icon-wrapper" style={{ backgroundColor: '#fff3cd' }}>
            <FaCoins style={{ fontSize: '40px', color: '#ffc107' }} />
          </div>
          <h3 style={{ color: '#d39e00', marginTop: '10px' }}>Hết Token</h3>
          <p>
            Bạn không đủ token để thực hiện phân tích này.
            Vui lòng nạp thêm token hoặc tham gia đánh giá chéo (peer review) để tiếp tục sử dụng tính năng AI.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button className="feedback-btn-primary" onClick={handleGoToProfile} style={{ backgroundColor: '#ffc107', color: '#000' }}>
              Nạp ngay
            </button>
            <button className="feedback-btn-secondary" onClick={() => setIsOutOfTokens(false)} style={{ marginTop: '0', width: 'auto' }}>
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Generic Error State */}
      {error && !isOutOfTokens && !isTimeout && (
        <div className="feedback-error-state">
          <FaExclamationCircle className="error-icon" />
          <p>{error}</p>
          <button className="feedback-btn-retry" onClick={handleAnalyze}>Thử lại</button>
        </div>
      )}

      {/* Results State */}
      {feedbackData && (
        <div className="feedback-results fade-in">
          <div className="feedback-header-card">
            <div className="score-circle">
              <span className="score-value">{feedbackData.overall_score || 0}</span>
              <span className="score-label">ĐIỂM</span>
            </div>
            <div className="score-text">
              <h4>Hoàn tất phân tích AI</h4>
            </div>
          </div>

          <div className="feedback-markdown-content">
            <ReactMarkdown
              children={feedbackData.result_markdown || "Không có phản hồi chi tiết."}
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ node, ...props }) => <h5 className="fb-h1" {...props} />,
                h2: ({ node, ...props }) => <h6 className="fb-h2" {...props} />,
                ul: ({ node, ...props }) => <ul className="fb-ul" {...props} />,
                li: ({ node, ...props }) => <li className="fb-li" {...props} ><FaCheckCircle className="fb-bullet" /><span>{props.children}</span></li>
              }}
            />
          </div>

          <button className="feedback-btn-secondary" onClick={handleAnalyze}>
            Phân tích lại
          </button>
        </div>
      )}
    </div>
  );
};

export default CVFeedbackView;