import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import websocketService from '../utils/websocketService';
import toast from '../utils/toast';
import { useNavigate } from 'react-router-dom';

const InterviewContext = createContext(null);



export function InterviewProvider({ children }) {
  const [activeTab, setActiveTab] = useState('text');
  const [showFeedback, setShowFeedback] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);
  const [detailedFeedback, setDetailedFeedback] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [cvAnalysisId, setCvAnalysisId] = useState(null);
  const [candidateId, setCandidateId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isAiThinking, setIsAiThinking] = useState(false);

  const navigate = useNavigate();

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handleEndSession = async () => {
    if (!interviewId) {
      toast.warning('Không có buổi phỏng vấn nào đang diễn ra.');
      return;
    }

    try {
      setIsStarting(true);
      toast.info('Đang kết thúc buổi phỏng vấn và tạo báo cáo đánh giá...');

      const response = await axios.put(
        API_ENDPOINTS.STOP_AI_INTERVIEW(interviewId),
        {},
        { withCredentials: true }
      );

      const feedbackData = response.data;

      if (feedbackData) {
        setDetailedFeedback(feedbackData);
        setShowFeedback(true);

        toast.success('Buổi phỏng vấn đã kết thúc thành công! Xem kết quả bên dưới.');
      }
    } catch (err) {
      console.error('Lỗi khi kết thúc phỏng vấn:', err);
      const message = err.response?.data?.message || 'Không thể kết thúc phỏng vấn. Vui lòng thử lại.';
      toast.error(message);

      if (err.response?.data) {
        setDetailedFeedback(err.response.data);
        setShowFeedback(true);
      }
    } finally {
      setIsStarting(false);

      setInterviewId(null);
      setWsUrl(null);
      setMessages([]);

      if (wsUrl) {
        websocketService.disconnect();
      }
    }
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
    navigate("/interview");
  };

  const handleDetailedFeedbackReceived = (feedback) => {
    setDetailedFeedback(feedback);
    setShowFeedback(true);
  };

  const value = {
    // State
    activeTab,
    showFeedback,
    interviewId,
    wsUrl,
    detailedFeedback,
    isStarting,
    cvAnalysisId,
    candidateId,
    messages,
    isAiThinking,

    // Setters
    setActiveTab,
    setShowFeedback,
    setInterviewId,
    setWsUrl,
    setDetailedFeedback,
    setIsStarting,
    setCvAnalysisId,
    setCandidateId,
    setMessages,
    setIsAiThinking,

    // Handlers
    handleTabSwitch,
    handleEndSession,
    handleCloseFeedback,
    handleDetailedFeedbackReceived,
  };

  return (
    <InterviewContext.Provider value={value}>
      {children}
    </InterviewContext.Provider>
  );
}

export function useInterview() {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }
  return context;
}