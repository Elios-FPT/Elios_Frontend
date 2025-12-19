// src/interview/components/CVUploadCard.jsx
import React, { useState, useRef } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import toast from '../utils/toast';
import { useInterview } from '../context/InterviewContext';

export default function CVUploadCard() {
  const {
    cvAnalysisId,
    candidateId,
    setCvAnalysisId,
    setCandidateId,
    setInterviewId,
    setWsUrl,
    setIsStarting,
  } = useInterview();

  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Chỉ chấp nhận file PDF');
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setIsUploadSuccess(false);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(API_ENDPOINTS.UPLOAD_CV, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      setCvAnalysisId(res.data.id);
      setCandidateId(res.data.candidate_id);
      setIsUploadSuccess(true);
      toast.success('CV đã được tải lên thành công!');
    } catch (err) {
      toast.error('Tải CV thất bại');
      setSelectedFile(null);
      setIsUploadSuccess(false);
      e.target.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  const handleStartInterview = async () => {
    if (!cvAnalysisId || !candidateId) return;

    setIsPlanning(true);
    setIsStarting(true);
    try {
      toast.info('Đang chuẩn bị phỏng vấn...');
      const res = await axios.post(API_ENDPOINTS.PLAN_INTERVIEW, {
        cv_analysis_id: cvAnalysisId,
        candidate_id: candidateId,
      }, { withCredentials: true });

      setInterviewId(res.data.interview_id);
      setWsUrl(res.data.ws_url);
      toast.success('Bắt đầu phỏng vấn nào!');
    } catch (err) {
      toast.error('Không thể bắt đầu phỏng vấn');
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

  return (
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
            <span className="material-icons spin">hourglass_empty</span> Đang chuẩn bị...
          </>
        ) : (
          <>
            <span className="material-icons">play_arrow</span> Bắt đầu phỏng vấn
          </>
        )}
      </button>
    </div>
  );
}