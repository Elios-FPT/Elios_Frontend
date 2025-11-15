import React, { createContext, useContext, useState } from 'react';

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
  const [messages, setMessages] = useState([]); // Shared messages across TextChat and VoiceChat

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handleEndSession = () => {
    setShowFeedback(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
  };

  const handleDetailedFeedbackReceived = (feedback) => {
    setDetailedFeedback(feedback);
    setShowFeedback(true); // Automatically open modal when feedback is received
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

