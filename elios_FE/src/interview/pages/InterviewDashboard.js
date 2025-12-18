// file: elios_FE/src/interview/pages/InterviewDashboard.js
import React, { useState, useRef } from 'react';
import CVUploadCard from '../components/CVUploadCard';
import PublicInterviewList from '../components/PublicInterviewList';
import { useInterview } from '../context/InterviewContext';
import '../style/InterviewPage.css';

export default function InterviewDashboard() {
  const { interviewId, setInterviewId, setWsUrl } = useInterview();
  const [activeSection, setActiveSection] = useState('my-interview');

  // Nếu đã có interview đang chạy → chuyển sang session page
  if (interviewId) {
    return null; // sẽ được xử lý ở route cha
  }

  return (
    <div id="interview-page">
      <div id="interview-container">
        <div className="header">
          <div className="header-left">
            <h1 className="header-title">Mock Interview & Peer Review</h1>
            <p className="header-subtitle">Chọn chế độ: Tạo phỏng vấn hoặc review cho người khác</p>
          </div>
          <div className="section-tabs">
            <button
              className={activeSection === 'my-interview' ? 'active' : ''}
              onClick={() => setActiveSection('my-interview')}
            >
              My Interview
            </button>
            <button
              className={activeSection === 'review-others' ? 'active' : ''}
              onClick={() => setActiveSection('review-others')}
            >
              Review Others
            </button>
          </div>
        </div>

        <div className="main-content">
          {activeSection === 'my-interview' ? <CVUploadCard /> : <PublicInterviewList />}
        </div>
      </div>
    </div>
  );
}