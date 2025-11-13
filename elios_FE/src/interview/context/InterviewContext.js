import React, { createContext, useContext, useState } from 'react';

const InterviewContext = createContext(null);

export function InterviewProvider({ children }) {
  const [activeTab, setActiveTab] = useState('text');
  const [showFeedback, setShowFeedback] = useState(false);
  const [interviewId, setInterviewId] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [isStarting, setIsStarting] = useState(false);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
  };

  const handleEndSession = () => {
    setShowFeedback(true);
  };

  const handleCloseFeedback = () => {
    setShowFeedback(false);
  };

  const handleEvaluationReceived = (evaluation) => {
    setEvaluations(prev => [...prev, evaluation]);
  };

  const value = {
    // State
    activeTab,
    showFeedback,
    interviewId,
    wsUrl,
    evaluations,
    isStarting,
    // Setters
    setActiveTab,
    setShowFeedback,
    setInterviewId,
    setWsUrl,
    setEvaluations,
    setIsStarting,
    // Handlers
    handleTabSwitch,
    handleEndSession,
    handleCloseFeedback,
    handleEvaluationReceived,
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

