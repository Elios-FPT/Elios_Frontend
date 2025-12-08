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

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (wsUrl) websocketService.disconnect();
    };
  }, [wsUrl]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Chỉ chấp nhận file PDF');
      event.target.value = '';
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setIsUploadSuccess(false);

    try {
      const response = await apiService.uploadCV(file);

      if (response.id && response.candidate_id) {

        setCvAnalysisId(response.id);
        setCandidateId(response.candidate_id);
        setIsUploadSuccess(true);
        toast.success('CV đã được tải lên thành công!');
      } else {
        throw new Error('Server response không đúng định dạng');
      }
    } catch (err) {
      toast.error('Tải CV thất bại. Vui lòng thử lại.');
      setSelectedFile(null);
      setIsUploadSuccess(false);
      event.target.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!cvAnalysisId || !candidateId) {
      toast.warning('Vui lòng tải CV trước');
      return;
    }

    setIsPlanning(true);
    setIsStarting(true);

    try {
      toast.info('Đang chuẩn bị phỏng vấn...');

      const planResponse = await apiService.planInterview(cvAnalysisId, candidateId);

      const { interview_id, ws_url, status } = planResponse;

      if (!interview_id || !ws_url) {
        throw new Error('Không nhận được interview_id hoặc ws_url');
      }

      setInterviewId(interview_id);
      setWsUrl(ws_url);

      toast.success('Sẵn sàng! Bắt đầu phỏng vấn nào!');
    } catch (err) {
      console.error('Start interview error:', err);
      toast.error('Không thể bắt đầu phỏng vấn. Vui lòng thử lại.');
    } finally {
      setIsPlanning(false);
      setIsStarting(false);
    }
  };

  const handleChangeCV = () => {
    setSelectedFile(null);
    setIsUploadSuccess(false);
    setCvAnalysisId(null);
    setCandidateId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (interviewId) {
    return (
      <div id="interview-page">
        <div id="interview-container">
          <div className="header">
            <div className="header-left">
              <h1 className="header-title">Mock Interview Session</h1>
            </div>
          </div>

          <div className="main-content">
            {activeTab === 'text' ? (
              <TextChat interviewId={interviewId} wsUrl={wsUrl} onDetailedFeedbackReceived={handleDetailedFeedbackReceived} />
            ) : (
              <VoiceChat interviewId={interviewId} wsUrl={wsUrl} onDetailedFeedbackReceived={handleDetailedFeedbackReceived} />
            )}
          </div>

          <TabControls activeTab={activeTab} onTabSwitch={handleTabSwitch} onEndSession={handleEndSession} />
        </div>

        {showFeedback && <FeedbackModal detailedFeedback={detailedFeedback} onClose={handleCloseFeedback} />}
      </div>
    );
  }

  return (
    <div id="interview-page">
      <div id="interview-container">
        <div className="header">
          <div className="header-left">
            <h1 className="header-title">Mock Interview Session</h1>
            <p className="header-subtitle">Tải CV lên và bắt đầu phỏng vấn ngay!</p>
          </div>
        </div>

        <div className="main-content">
          <div className="start-interview-card compact">
            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />

              {isUploadSuccess && selectedFile ? (
                <div className="upload-success">
                  <span className="material-icons">check_circle</span>
                  <div>
                    <strong>Đã tải lên:</strong> {selectedFile.name}
                  </div>
                  <button className="change-cv-btn" onClick={handleChangeCV}>
                    Thay đổi
                  </button>
                </div>
              ) : (
                <div className="upload-prompt" onClick={() => fileInputRef.current?.click()}>
                  {isUploading ? (
                    <>
                      <span className="material-icons spin">autorenew</span>
                      <p>Đang tải CV lên...</p>
                    </>
                  ) : (
                    <>
                      <span className="material-icons large">cloud_upload</span>
                      <p>Click để tải CV lên (chỉ hỗ trợ PDF)</p>
                      {selectedFile && <small>Đã chọn: {selectedFile.name}</small>}
                    </>
                  )}
                </div>
              )}
            </div>

            <button
              className="start-interview-button large"
              onClick={handleStartInterview}
              disabled={!isUploadSuccess || isPlanning}
            >
              {isPlanning ? (
                <>
                  <span className="material-icons spin">hourglass_empty</span>
                  Đang chuẩn bị...
                </>
              ) : (
                <>
                  <span className="material-icons">play_arrow</span>
                  Bắt đầu phỏng vấn
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;