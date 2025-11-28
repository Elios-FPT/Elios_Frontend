import React, { useState, useRef, useEffect } from 'react';
import TextChat from '../components/TextChat';
import VoiceChat from '../components/VoiceChat';
import TabControls from '../components/TabControls';
import FeedbackModal from '../components/FeedbackModal';
import { useInterview } from '../context/InterviewContext';
import apiService from '../utils/apiService';
import websocketService from '../utils/websocketService';
import { INTERVIEW_STATUS } from '../utils/config';
import toast from '../utils/toast';
import '../style/InterviewPage.css';

function InterviewPage() {
  const {
    activeTab,
    showFeedback,
    interviewId,
    wsUrl,
    detailedFeedback,
    isStarting,
    cvAnalysisId,
    candidateId,
    setInterviewId,
    setWsUrl,
    setShowFeedback,
    setCvAnalysisId,
    setCandidateId,
    handleTabSwitch,
    handleEndSession,
    handleCloseFeedback,
    handleDetailedFeedbackReceived,
    setIsStarting,
  } = useInterview();

  const [cvFile, setCvFile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [cvUploaded, setCvUploaded] = useState(false);
  const [isUploadingCV, setIsUploadingCV] = useState(false);
  const [step1Completed, setStep1Completed] = useState(false);
  const [step2Status, setStep2Status] = useState('pending');
  const [interviewSubStep, setInterviewSubStep] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef(null);

  // Disconnect WebSocket when interview ends or component unmounts
  useEffect(() => {
    // Disconnect when interviewId becomes null (interview ended)
    if (!interviewId && wsUrl) {
      websocketService.disconnect();
    }

    // Cleanup on unmount
    return () => {
      if (wsUrl) {
        websocketService.disconnect();
      }
    };
  }, [interviewId, wsUrl]);

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
    setStep1Completed(false); // Reset step 1 completion if file is changed
  };

  const handleCVUpload = async () => {
    if (!selectedFile) {
      toast.warning('Please select a file first');
      return;
    }

    setIsUploadingCV(true);

    try {
      const response = await apiService.uploadCV(selectedFile);

      // Extract id (CV analysis ID) and candidate_id from response
      if (response.id) {
        setCvAnalysisId(response.id);
      }
      if (response.candidate_id) {
        setCandidateId(response.candidate_id);
      }

      setCvFile(selectedFile);
      setCvUploaded(true);
      setStep1Completed(true);
      toast.success(`CV uploaded successfully: ${selectedFile.name}`);
    } catch (error) {
      console.error('Failed to upload CV:', error);
      toast.error('Failed to upload CV. Please try again.');
      setCvFile(null);
      setCvUploaded(false);
      setStep1Completed(false);
      setCvAnalysisId(null);
      setCandidateId(null);
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
    setStep1Completed(false);
    setCvAnalysisId(null);
    setCandidateId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNext = () => {
    if (step1Completed) {
      setCurrentPage(2);
    }
  };

  const handleBack = () => {
    setCurrentPage(1);
  };

  const handleStartInterview = async () => {
    // Validate that CV analysis and candidate IDs exist
    if (!cvAnalysisId || !candidateId) {
      toast.error('Please upload your CV first before starting the interview.');
      return;
    }

    setIsStarting(true);
    setStep2Status('in-progress');

    try {
      // Planning interview - returns interview_id, status, and ws_url when ready
      setInterviewSubStep('planning');
      toast.info('Planning your interview...');

      const planResponse = await apiService.planInterview(cvAnalysisId, candidateId);
      const interviewId = planResponse.interview_id;
      setInterviewId(interviewId);

      // Check if planning is complete (status is IDLE) and ws_url is available
      if (planResponse.status && planResponse.status.toUpperCase() === INTERVIEW_STATUS.IDLE && planResponse.ws_url) {
        setWsUrl(planResponse.ws_url);
        setStep2Status('completed');
        setInterviewSubStep(null);
        toast.success('Interview ready!');
      } else {
        // If not ready yet, this shouldn't happen but handle gracefully
        throw new Error('Interview planning not complete. Please try again.');
      }

    } catch (error) {
      console.error('Failed to start interview:', error);
      toast.error('Failed to start interview. Please try again.');
      setStep2Status('pending');
      setInterviewSubStep(null);
    } finally {
      setIsStarting(false);
    }
  };

  const renderStepIndicator = () => {
    const step2IsActive = step2Status === 'in-progress' || step2Status === 'completed';
    const step2IsCompleted = step2Status === 'completed';
    const step1IsActive = currentPage === 1 && !step1Completed;

    return (
      <ul className="progressbar">
        <li className={step1Completed ? 'complete' : step1IsActive ? 'active' : ''}>Step 1</li>
        <li className={step2IsCompleted ? 'complete' : step2IsActive ? 'active' : ''}>Step 2</li>
      </ul>
    );
  };

  const renderStepHeader = () => {
    if (currentPage === 1) {
      return (
        <div className="step-header">
          <h3 className="step-title">Upload Your CV</h3>
          <p className="step-guide">Please upload your CV in PDF format. This will help us personalize your interview experience.</p>
        </div>
      );
    } else {
      return (
        <div className="step-header">
          <h3 className="step-title">Start Your Interview</h3>
          <p className="step-guide">Click the button below to begin your mock interview session. We'll prepare everything for you.</p>
        </div>
      );
    }
  };

  const renderPage1 = () => {
    return (
      <div className="page-content page-1">
        <div className="cv-upload-section">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          <div className="cv-upload-row">
            {!selectedFile && !cvUploaded && (
              <button
                className="cv-choose-button"
                onClick={handleFileInputClick}
                disabled={isUploadingCV || step1Completed}
              >
                <span className="material-icons">folder_open</span>
                Choose File
              </button>
            )}

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

            {!cvUploaded && (
              <button
                className="cv-upload-button"
                onClick={handleCVUpload}
                disabled={isUploadingCV || !selectedFile}
              >
                {isUploadingCV ? (
                  <>
                    <span className="material-icons spin">autorenew</span>
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

            {cvUploaded && (
              <button
                className="cv-upload-button"
                disabled={true}
              >
                <span className="material-icons">upload_file</span>
                Upload CV
              </button>
            )}
          </div>
        </div>

        <div className="page-navigation">
          <button
            className="next-button"
            onClick={handleNext}
            disabled={!step1Completed}
          >
            Next
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>
    );
  };

  const renderPage2 = () => {
    return (
      <div className="page-content page-2">
        <div className="cv-upload-section">
          {(step2Status === 'in-progress' || step2Status === 'completed') && (
            <div className="interview-substeps">
              <div className={`substep ${interviewSubStep === 'planning' ? 'active' : step2Status === 'completed' ? 'completed' : ''}`}>
                <span className="material-icons">
                  {interviewSubStep === 'planning' ? 'autorenew' : step2Status === 'completed' ? 'check' : ''}
                </span>
                <span>Planning interview...</span>
              </div>
            </div>
          )}
          {step2Status === 'pending' && !isStarting && (
            <button
              className="start-interview-button"
              onClick={handleStartInterview}
              disabled={!step1Completed}
            >
              Start Interview
            </button>
          )}
        </div>

        <div className="page-navigation">
          <button
            className="back-button"
            onClick={handleBack}
            disabled={isStarting}
          >
            <span className="material-icons">arrow_back</span>
            Back
          </button>
        </div>
      </div>
    );
  };

  const renderStartButton = () => {
    if (interviewId) return null;

    return (
      <div id="interview-start-container">
        <div className="start-interview-card">
          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Step Header */}
          {renderStepHeader()}

          {/* Page Content */}
          {currentPage === 1 ? renderPage1() : renderPage2()}
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
          detailedFeedback={detailedFeedback}
          onClose={handleCloseFeedback}
        />
      )}
    </div>
  );
}

export default InterviewPage;

