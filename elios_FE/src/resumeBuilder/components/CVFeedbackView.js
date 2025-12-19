// file: elios_FE/src/resumeBuilder/components/CVFeedbackView.js
import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaMagic, FaCheckCircle, FaExclamationCircle, FaRobot } from 'react-icons/fa';
import { Spinner, ProgressBar } from 'react-bootstrap';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/CVFeedbackView.css';

const CVFeedbackView = ({ resumeData, resumeId }) => {
  const [loading, setLoading] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setFeedbackData(null);

    try {
      // Prepare the payload
      const payload = {
        entity_id: resumeId, // Use the CV ID
        input_type: "CV",
        feedback_input: JSON.stringify(resumeData),
      };

      const response = await axios.post(
        API_ENDPOINTS.AI_FEEDBACK_ANALYZE, 
        payload, 
        { withCredentials: true }
      );

      if (response.data && response.data.status === 'SUCCESS') {
        setFeedbackData(response.data);
      } else {
        setError('Unable to analyze resume. Please try again.');
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);
      setError('An error occurred while connecting to the AI assistant.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cv-feedback-container">
      {/* Empty State */}
      {!feedbackData && !loading && !error && (
        <div className="feedback-empty-state">
          <div className="feedback-icon-wrapper">
            <FaRobot className="feedback-mascot" />
          </div>
          <h3>Ready for a Review?</h3>
          <p>
            I can analyze your resume to check for clarity, impact, and missing details. 
            Click below to get instant feedback!
          </p>
          <button className="feedback-btn-primary" onClick={handleAnalyze}>
            <FaMagic style={{ marginRight: '8px' }} /> Analyze My Resume
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="feedback-loading-state">
          <Spinner animation="border" variant="success" />
          <p>Reading your resume...</p>
          <small>Looking for keywords, formatting, and impact...</small>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="feedback-error-state">
          <FaExclamationCircle className="error-icon" />
          <p>{error}</p>
          <button className="feedback-btn-retry" onClick={handleAnalyze}>Try Again</button>
        </div>
      )}

      {/* Results State */}
      {feedbackData && (
        <div className="feedback-results fade-in">

          <div className="feedback-markdown-content">
             {/* Use the markdown provided by backend if available */}
             <ReactMarkdown 
                children={feedbackData.result_markdown || "No detailed feedback available."} 
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({node, ...props}) => <h5 className="fb-h1" {...props} />,
                    h2: ({node, ...props}) => <h6 className="fb-h2" {...props} />,
                    ul: ({node, ...props}) => <ul className="fb-ul" {...props} />,
                    li: ({node, ...props}) => <li className="fb-li" {...props} ><FaCheckCircle className="fb-bullet"/><span>{props.children}</span></li>
                }}
             />
          </div>

          <button className="feedback-btn-secondary" onClick={handleAnalyze}>
             Analyze Again
          </button>
        </div>
      )}
    </div>
  );
};

export default CVFeedbackView;