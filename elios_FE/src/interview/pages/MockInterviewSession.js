// file: elios_FE/src/interview/pages/MockInterviewSession.js
import React from 'react';
import TextChat from '../components/TextChat';
import VoiceChat from '../components/VoiceChat';
import TabControls from '../components/TabControls';
import FeedbackModal from '../components/FeedbackModal';
import { useInterview } from '../context/InterviewContext';

export default function MockInterviewSession() {
  const {
    activeTab,
    showFeedback,
    interviewId,
    wsUrl,
    detailedFeedback,
    handleTabSwitch,
    handleEndSession,
    handleCloseFeedback,
    handleDetailedFeedbackReceived,
  } = useInterview();

  return (
    <div id="interview-page">
      <div id="interview-container">
        <div className="header">
          <h1 className="header-title">Mock Interview Session</h1>
        </div>

        <div className="main-content">
          {activeTab === 'text' ? (
            <TextChat
              interviewId={interviewId}
              wsUrl={wsUrl}
              onDetailedFeedbackReceived={handleDetailedFeedbackReceived}
            />
          ) : (
            <VoiceChat
              interviewId={interviewId}
              wsUrl={wsUrl}
              onDetailedFeedbackReceived={handleDetailedFeedbackReceived}
            />
          )}
        </div>

        <TabControls
          activeTab={activeTab}
          onTabSwitch={handleTabSwitch}
          onEndSession={handleEndSession}
        />

        {showFeedback && (
          <FeedbackModal
            detailedFeedback={detailedFeedback}
            onClose={handleCloseFeedback}
          />
        )}
      </div>
    </div>
  );
}