import React, { useState, useRef } from 'react';
import TextChat from '../components/TextChat';
import VoiceChat from '../components/VoiceChat';
import TabControls from '../components/TabControls';
import FeedbackModal from '../components/FeedbackModal';
import { useInterview } from '../context/InterviewContext';
import apiService from '../utils/apiService';
import toast from '../utils/toast';
import '../style/InterviewPage.css';

function InterviewPage() {
  const {
    activeTab,
    showFeedback,
    interviewId,
    wsUrl,
    evaluations,
    isStarting,
    setInterviewId,
    setWsUrl,
    setShowFeedback,
    handleTabSwitch,
    handleEndSession,
    handleCloseFeedback,
    handleEvaluationReceived,
    setIsStarting,
  } = useInterview();

  const [cvFile, setCvFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      event.target.value = ''; // Reset file input
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setCvUploaded(false); // Reset upload status if file is changed
  };

  const handleCVUpload = async () => {
    if (!selectedFile) {
      toast.warning('Please select a file first');
      return;
    }

    setIsUploadingCV(true);

    try {
      const response = await apiService.uploadCV(selectedFile);
      setCvFile(selectedFile);
      setCvUploaded(true);
      toast.success(`CV uploaded successfully: ${selectedFile.name}`);
    } catch (error) {
      console.error('Failed to upload CV:', error);
      toast.error('Failed to upload CV. Please try again.');
      setCvFile(null);
      setCvUploaded(false);
    } finally {
      setIsUploadingCV(false);
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const handleChangeFile = () => {
    setSelectedFile(null);
    setCvUploaded(false);
    setCvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartInterview = async () => {
    setIsStarting(true);

    try {
      // Step 1: Plan interview
      const planResponse = await apiService.planInterview();
      const interviewId = planResponse.interview_id;
      setInterviewId(interviewId);

      toast.info('Planning your interview...');

      // Step 2: Poll planning status
      await apiService.pollPlanningStatus(interviewId, (status) => {
        console.log('Planning status:', status.status);
      });

      toast.success('Interview ready!');

      // Step 3: Start interview
      const startResponse = await apiService.startInterview(interviewId);
      setWsUrl(startResponse.ws_url);

    } catch (error) {
      console.error('Failed to start interview:', error);
      toast.error('Failed to start interview. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  const renderStartButton = () => {
    if (interviewId) return null;

    return (
      <div id="interview-start-container">
        <div className="start-interview-card">
          <h2>Ready to Begin?</h2>
          <p>Click below to start your mock interview session</p>

          {/* CV Upload Section */}
          <div className="cv-upload-section">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <div className="cv-file-selection">
              <button
                className="cv-choose-button"
                onClick={handleFileInputClick}
                disabled={isUploadingCV}
              >
                <span className="material-icons">folder_open</span>
                Choose File
              </button>

              {selectedFile && !cvUploaded && (
                <div className="cv-selected-file">
                  <span className="material-icons">description</span>
                  <span className="file-name">{selectedFile.name}</span>
                  <button
                    className="cv-change-file-button"
                    onClick={handleChangeFile}
                    disabled={isUploadingCV}
                    title="Change file"
                  >
                    <span className="material-icons">close</span>
                  </button>
                </div>
              )}
            </div>

            {selectedFile && !cvUploaded && (
              <button
                className="cv-upload-button"
                onClick={handleCVUpload}
                disabled={isUploadingCV}
              >
                {isUploadingCV ? (
                  <>
                    <span className="material-icons spin">sync</span>
                    Uploading...
                  </>
                ) : (
                  <>
                    <span className="material-icons">upload_file</span>
                    Upload CV
                  </>
                )}
              </button>
            )}

            {cvUploaded && cvFile && (
              <div className="cv-upload-status">
                <span className="material-icons">check_circle</span>
                <span>CV uploaded: {cvFile.name}</span>
                <button
                  className="cv-change-file-button"
                  onClick={handleChangeFile}
                  title="Change file"
                >
                  <span className="material-icons">close</span>
                </button>
              </div>
            )}

            {!selectedFile && !cvUploaded && (
              <p className="cv-upload-hint">Please upload your CV before starting the interview</p>
            )}
          </div>

          <button
            className="start-interview-button"
            onClick={handleStartInterview}
            disabled={isStarting || !cvUploaded}
          >
            {isStarting ? 'Starting...' : 'Start Interview'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div id="interview-page">
      <div id="interview-container">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1 className="header-title">Mock Interview Session</h1>
            <div className="info-icon material-icons">info</div>
          </div>
          <div className="header-right">
            <div className="header-icons">
              <div className="icon settings-icon material-icons">settings</div>
              <div className="icon help-icon material-icons">help</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {!interviewId ? (
            renderStartButton()
          ) : activeTab === 'text' ? (
            <TextChat
              interviewId={interviewId}
              wsUrl={wsUrl}
              onEvaluationReceived={handleEvaluationReceived}
            />
          ) : (
            <VoiceChat />
          )}
        </div>

        {/* Bottom Controls */}
        {interviewId && (
          <TabControls
            activeTab={activeTab}
            onTabSwitch={handleTabSwitch}
            onEndSession={handleEndSession}
          />
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          evaluations={evaluations}
          onClose={handleCloseFeedback}
        />
      )}
    </div>
  );
}

export default InterviewPage;

