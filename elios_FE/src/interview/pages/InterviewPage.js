import React, { useState, useRef, useEffect } from 'react';
import TextChat from '../components/TextChat';
import VoiceChat from '../components/VoiceChat';
import TabControls from '../components/TabControls';
import FeedbackModal from '../components/FeedbackModal';
import { useInterview } from '../context/InterviewContext';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import websocketService from '../utils/websocketService';
import toast from '../utils/toast';
import '../style/InterviewPage.css';
import { useNavigate } from "react-router-dom";

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

  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('my-interview');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadSuccess, setIsUploadSuccess] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const fileInputRef = useRef(null);

  const [publicInterviews, setPublicInterviews] = useState([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [reviewProgress, setReviewProgress] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [interviewSessionId, setInterviewSessionId] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  

  useEffect(() => {
    if (activeSection === 'review-others') {
      fetchPublicInterviews();
    }
    return () => {
      if (wsUrl) websocketService.disconnect();
    };
  }, [activeSection, wsUrl]);

  const fetchPublicInterviews = async () => {
    setIsLoadingPublic(true);
    try {
      const response = await axios.get(API_ENDPOINTS.PEER_BROWSE_PUBLIC_POOL, { withCredentials: true });
      if (response.data.status === 200) {
        setPublicInterviews(response.data.responseData || []);
      } else {
        toast.error('Không thể tải danh sách interview công khai.');
      }
    } catch (err) {
      toast.error('Lỗi khi tải danh sách.');
    } finally {
      setIsLoadingPublic(false);
    }
  };

  const fetchInterviewConversation = async (interviewSessionId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.GET_AI_INTERVIEW_CONVERSATION(interviewSessionId),
        { withCredentials: true }
      );
      if (response.data?.messages) {
        setConversationMessages(response.data.messages);
      } else {
        toast.error('Không nhận được dữ liệu cuộc trò chuyện.');
      }
    } catch (err) {
      console.error('Fetch conversation error:', err);
      toast.error('Lỗi khi tải nội dung phỏng vấn.');
    }
  };

  const handleStartReview = async (interviewSessionId) => {
    try {
      setInterviewSessionId(interviewSessionId);
      setIsReviewing(true);

      const detailRes = await axios.get(API_ENDPOINTS.GET_AI_INTERVIEW_DETAIL(interviewSessionId), {
        withCredentials: true,
      });

      await fetchInterviewConversation(interviewSessionId);

      const publicItem = publicInterviews.find(
        (i) => i.interviewSessionId === interviewSessionId
      );

      if (publicItem?.myDraft?.id) {
        setSubmissionId(publicItem.myDraft.id);
        await fetchReviewProgress(publicItem.myDraft.id);
        toast.success('Tiếp tục review draft của bạn');
        return;
      }

      const startRes = await axios.post(
        API_ENDPOINTS.PEER_START_REVIEW,
        { sharedInterviewId: publicItem.id },
        { withCredentials: true }
      );

      if (startRes.data?.status === 409) {
        alert('Bạn đã hoàn thành review cho buổi phỏng vấn này rồi!');
        setIsReviewing(false);
        setInterviewSessionId(null);
        navigate('/interview');
        return;
      }

      if (startRes.data.status === 201) {
        setSubmissionId(startRes.data.responseData.submissionId);
        await fetchReviewProgress(startRes.data.responseData.submissionId);
        toast.success('Đã bắt đầu review mới!');
      }
    } catch (err) {
      console.error('Start review error:', err);

      toast.error(
        err.response?.data?.message || 'Không thể bắt đầu review. Vui lòng thử lại.'
      );

      setIsReviewing(false);
      setInterviewSessionId(null);
    }
  };
  const fetchReviewProgress = async (subId) => {
    if (!subId) return;
    setIsProgressLoading(true);
    try {
      const response = await axios.get(API_ENDPOINTS.PEER_GET_PROGRESS(subId), { withCredentials: true });
      if (response.data.status === 200) {
        setReviewProgress(response.data.responseData);
      }
    } catch (err) {
      toast.error('Lỗi tải tiến độ');
    } finally {
      setIsProgressLoading(false);
    }
  };

  const handleSaveDraftReview = async (questionId, skillRating, softSkillRating, comment) => {
    if (!submissionId || !questionId) return;

    setSavingQuestionId(questionId);

    try {
      const res = await axios.put(
        API_ENDPOINTS.PEER_SAVE_DRAFT_REVIEW,
        {
          submissionId,
          questionId,
          skillRating: Number(skillRating),
          softSkillRating: Number(softSkillRating),
          comment: comment || null,
        },
        { withCredentials: true }
      );

      if (res.data.status === 200 || res.data.status === 201) {
        await fetchReviewProgress(submissionId); // cập nhật tiến độ
        toast.success('Đã lưu câu này!', { duration: 2000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Lưu thất bại, vui lòng thử lại');
    } finally {
      setTimeout(() => setSavingQuestionId(null), 800);
    }
  };

  const handleSubmitReview = async () => {
    if (!submissionId) return;
    try {
      const response = await axios.post(
        API_ENDPOINTS.PEER_SUBMIT_REVIEW(submissionId),
        {},
        { withCredentials: true }
      );
      if (response.data.status === 200) {
        toast.success('Submit review thành công! Cảm ơn bạn!');
        resetReviewState();
        fetchPublicInterviews();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi submit review');
    }
  };

  const handleDeleteDraft = async () => {
    if (!submissionId) return;
    try {
      await axios.delete(API_ENDPOINTS.PEER_DELETE_DRAFT(submissionId), { withCredentials: true });
      toast.success('Đã xóa draft và thoát.');
      resetReviewState();
      fetchPublicInterviews();
    } catch (err) {
      toast.error('Lỗi khi xóa draft.');
    }
  };

  const resetReviewState = () => {
    setIsReviewing(false);
    setSubmissionId(null);
    setReviewProgress(null);
    setConversationMessages([]);
    setInterviewSessionId(null);
  };

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
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(API_ENDPOINTS.UPLOAD_CV, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      if (response.data.id && response.data.candidate_id) {
        setCvAnalysisId(response.data.id);
        setCandidateId(response.data.candidate_id);
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
      const response = await axios.post(
        API_ENDPOINTS.PLAN_INTERVIEW,
        { cv_analysis_id: cvAnalysisId, candidate_id: candidateId },
        { withCredentials: true }
      );

      const { interview_id, ws_url } = response.data;
      if (!interview_id || !ws_url) throw new Error('Không nhận được interview_id hoặc ws_url');

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

  const buildReviewableItems = () => {
    if (!conversationMessages.length || !reviewProgress) return [];

    const questionsMap = {};
    const answersByQuestion = {};

    conversationMessages.forEach((msg) => {
      if (msg.type === 'question' || msg.type === 'followup') {
        const qId = msg.id;
        questionsMap[qId] = msg;
        if (!answersByQuestion[qId]) answersByQuestion[qId] = [];
      } else if (msg.type === 'answer') {
        const targetId = msg.follow_up_question_id || msg.question_id;
        if (targetId) {
          if (!answersByQuestion[targetId]) answersByQuestion[targetId] = [];
          answersByQuestion[targetId].push(msg);
        }
      }
    });

    const items = [];

    Object.keys(questionsMap).forEach((qId) => {
      const question = questionsMap[qId];
      const answers = answersByQuestion[qId] || [];

      if (answers.length === 0) {
        items.push({
          reviewId: `unanswered-${qId}`,
          question,
          answer: null,
          isFollowUp: question.type === 'followup',
          parentSequence: question.parent_sequence ?? question.sequence,
        });
      } else {
        const finalAnswer = answers[answers.length - 1];

        const savedReview = reviewProgress.reviews?.find(
          (r) => r.questionId === qId
        ) || {
          skillRating: '',
          softSkillRating: '',
          comment: '',
        };

        items.push({
          reviewId: qId,
          question,
          answer: finalAnswer,
          review: savedReview,
          isFollowUp: question.type === 'followup',
          parentSequence: question.parent_sequence ?? question.sequence,
        });
      }
    });

    return items.sort((a, b) => {
      const seqA = a.parentSequence ?? a.question.sequence;
      const seqB = b.parentSequence ?? b.question.sequence;
      if (seqA !== seqB) return seqA - seqB;
      return a.isFollowUp === b.isFollowUp ? 0 : a.isFollowUp ? 1 : -1;
    });
  };

  const reviewableItems = buildReviewableItems();
  if (interviewId || isReviewing || showFeedback) {
    return (
      <div id="interview-page">
        <div id="interview-container">
          <div className="header">
            <div className="header-left">
              <h1 className="header-title">
                {isReviewing ? 'Peer Review Session' : 'Mock Interview Session'}
              </h1>
            </div>
          </div>

          <div className="main-content">
            {isReviewing ? (
              <div className="review-container">
                {reviewProgress ? (
                  <>
                    <div style={{ marginBottom: 24, textAlign: 'left' }}>
                      <button
                        onClick={() => {
                          resetReviewState();
                          setActiveSection('review-others');
                        }}
                        style={{
                          padding: '10px 20px',
                          background: '#64748b',
                          color: 'white',
                          border: 'none',
                          borderRadius: 12,
                          fontSize: 15,
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 8,
                        }}
                      >
                        <span className="material-icons" style={{ fontSize: 20 }}>arrow_back</span>
                        Quay lại danh sách Review
                      </button>
                    </div>
                    <h2 style={{ color: '#1e40af', marginBottom: 20, textAlign: 'center' }}>
                      Tiến độ:{' '}
                      {isProgressLoading ? (
                        <span style={{ color: '#6366f1' }}>Đang cập nhật...</span>
                      ) : (
                        <>
                          <strong>{reviewProgress.reviewedCount}</strong>/{reviewProgress.questionCount} câu hỏi đã chấm
                        </>
                      )}
                    </h2>

                    {reviewableItems.map((item) => (
                      <ReviewItem
                        key={item.reviewId}
                        item={item}
                        isSaving={savingQuestionId === item.reviewId}
                        onSave={handleSaveDraftReview}
                      />
                    ))}

                    <div style={{ marginTop: 40, textAlign: 'center' }}>
                      <button
                        onClick={handleSubmitReview}
                        disabled={reviewProgress.reviewedCount < reviewProgress.questionCount}
                        style={{
                          padding: '14px 36px',
                          fontSize: 18,
                          fontWeight: 600,
                          border: 'none',
                          borderRadius: 12,
                          marginRight: 16,
                          background: reviewProgress.reviewedCount === reviewProgress.questionCount ? '#10b981' : '#94a3b8',
                          color: 'white',
                          cursor: reviewProgress.reviewedCount === reviewProgress.questionCount ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {reviewProgress.reviewedCount === reviewProgress.questionCount
                          ? 'Submit Review Hoàn Chỉnh'
                          : `Còn thiếu ${reviewProgress.questionCount - reviewProgress.reviewedCount} câu`}
                      </button>

                      <button
                        onClick={handleDeleteDraft}
                        style={{
                          padding: '14px 28px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: 12,
                        }}
                      >
                        Xóa Draft & Thoát
                      </button>
                    </div>
                  </>
                ) : (
                  <p>Đang tải tiến độ review...</p>
                )}
              </div>
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

          {!isReviewing && (
            <TabControls
              activeTab={activeTab}
              onTabSwitch={handleTabSwitch}
              onEndSession={handleEndSession}
            />
          )}
        </div>

        {showFeedback && (
          <FeedbackModal detailedFeedback={detailedFeedback} onClose={handleCloseFeedback} />
        )}
      </div>
    );
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
          {activeSection === 'my-interview' ? (
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
          ) : (
            <div className="start-interview-card compact" style={{ maxWidth: 800 }}>
              <h2 style={{ margin: '0 0 24px', color: '#1e40af' }}>
                Danh sách Interview đang mở để Review
              </h2>

              {isLoadingPublic ? (
                <p style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Đang tải danh sách...
                </p>
              ) : publicInterviews.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 16 }}>
                  Hiện tại không có interview nào đang mở cho review.
                </p>
              ) : (
                <div className="public-interview-grid">
                  {publicInterviews.map((interview) => {
                    const hasDraft = interview.myDraft !== null;
                    const draftDate = hasDraft
                      ? new Date(interview.myDraft.createdAt).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : null;

                    return (
                      <div key={interview.id} className="public-interview-card">
                        <div className="card-header">
                          <h3>{interview.title || 'General Interview'}</h3>
                          {hasDraft && (
                            <span className="draft-badge">
                              Draft của bạn ({draftDate})
                            </span>
                          )}
                        </div>

                        <div className="card-details">
                          <p>
                            <strong>Kỹ năng:</strong>{' '}
                            <span className="skills-tag">{interview.skills}</span>
                          </p>
                          <p>
                            <strong>Số câu hỏi:</strong> {interview.questionCount}
                          </p>
                          <p>
                            <strong>Ngày tạo:</strong>{' '}
                            {new Date(interview.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                          <p>
                            <strong>Reviewer hiện tại:</strong>{' '}
                            {interview.currentReviewerCount}
                          </p>
                        </div>

                        <div className="card-actions">
                          {interview.canReview ? (
                            <button
                              className="start-review-btn"
                              onClick={() => handleStartReview(interview.interviewSessionId)}
                              disabled={isReviewing}
                            >
                              {hasDraft ? 'Tiếp tục Review' : 'Bắt đầu Review'}
                            </button>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: 14 }}>
                              Đã đủ reviewer
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
const ReviewItem = ({ item, isSaving, onSave }) => {
  const [skillRating, setSkillRating] = useState(item.review?.skillRating || '');
  const [softSkillRating, setSoftSkillRating] = useState(item.review?.softSkillRating || '');
  const [comment, setComment] = useState(item.review?.comment || '');
  const [isDirty, setIsDirty] = useState(false);

  const questionId = item.reviewId.startsWith('unanswered-')
    ? item.reviewId.substring(11)
    : item.reviewId;

  useEffect(() => {
    const hasChanged =
      skillRating !== (item.review?.skillRating || '') ||
      softSkillRating !== (item.review?.softSkillRating || '') ||
      comment !== (item.review?.comment || '');

    setIsDirty(hasChanged);
  }, [skillRating, softSkillRating, comment, item.review]);

  const handleSave = () => {
    if (!skillRating || !softSkillRating) {
      toast.warning('Vui lòng chấm cả 2 điểm số trước khi lưu!');
      return;
    }
    onSave(questionId, skillRating, softSkillRating, comment);
  };

  const isSaved = !!item.review?.skillRating && !!item.review?.softSkillRating;
  const hasAnswer = !!item.answer;

  return (
    <div
      className="review-item"
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 16,
        padding: 28,
        marginBottom: 32,
        background: '#ffffff',
        boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 20,
          padding: '6px 12px',
          borderRadius: 20,
          fontSize: 13,
          fontWeight: 600,
          color: 'white',
          background: isSaved ? '#10b981' : '#f59e0b',
        }}
      >
        {isSaved ? 'Đã lưu' : 'Chưa lưu'}
      </div>

      {item.isFollowUp && (
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: 20,
            background: '#7c3aed',
            color: 'white',
            padding: '4px 10px',
            borderRadius: 12,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          FOLLOW-UP
        </div>
      )}

      <h3 style={item.isFollowUp ? { margin: '0 0 16px', color: '#1e293b', fontSize: 19, fontWeight: 600, marginTop: 20 } : { margin: '0 0 16px', color: '#1e293b', fontSize: 19, fontWeight: 600 }}>
        Câu hỏi: {item.question.text}
      </h3>

      <div
        style={{
          background: hasAnswer ? '#f8fafc' : '#fee2e2',
          padding: 18,
          borderRadius: 12,
          margin: '20px 0',
          borderLeft: hasAnswer ? '6px solid #3b82f6' : '6px solid #ef4444',
          fontSize: 15.5,
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: hasAnswer ? '#1e40af' : '#991b1b' }}>
          Trả lời:
        </strong>{' '}
        {hasAnswer ? (
          item.answer.is_voice ? (
            <div style={{ marginTop: 10 }}>
              <audio
                controls
                src={item.answer.audio_path}
                style={{ width: '100%', maxWidth: 500 }}
              >
                Trình duyệt không hỗ trợ audio.
              </audio>
              <p style={{ fontStyle: 'italic', color: '#64748b', marginTop: 8 }}>
                (Giọng nói – vui lòng nghe để đánh giá)
              </p>
            </div>
          ) : (
            <span>{item.answer.text || '(Không có nội dung)'}</span>
          )
        ) : (
          <span style={{ color: '#991b1b', fontWeight: 600 }}>
            Ứng viên chưa trả lời câu này
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, margin: '28px 0' }}>
        <div>
          <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: '#1e40af', fontSize: 16 }}>
            Kỹ năng kỹ thuật (Technical Skill)
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={skillRating}
            onChange={(e) => setSkillRating(e.target.value)}
            style={{
              width: 90,
              padding: '12px 14px',
              fontSize: 18,
              borderRadius: 10,
              border: '2px solid #cbd5e1',
              textAlign: 'center',
            }}
          />
          <span style={{ marginLeft: 16, fontSize: 22, fontWeight: 600, color: '#1e40af' }}>
            {skillRating ? `${skillRating}/5` : '–/5'}
          </span>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 10, fontWeight: 600, color: '#1e40af', fontSize: 16 }}>
            Giao tiếp & Trình bày
          </label>
          <input
            type="number"
            min="1"
            max="5"
            value={softSkillRating}
            onChange={(e) => setSoftSkillRating(e.target.value)}
            style={{
              width: 90,
              padding: '12px 14px',
              fontSize: 18,
              borderRadius: 10,
              border: '2px solid #cbd5e1',
              textAlign: 'center',
            }}
          />
          <span style={{ marginLeft: 16, fontSize: 22, fontWeight: 600, color: '#1e40af' }}>
            {softSkillRating ? `${softSkillRating}/5` : '–/5'}
          </span>
        </div>
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Nhận xét chi tiết – rất hữu ích cho ứng viên... (khuyến khích)"
        rows={6}
        style={{
          width: '100%',
          padding: 16,
          borderRadius: 12,
          border: '2px solid #cbd5e1',
          marginTop: 8,
          fontSize: 15.5,
          fontFamily: 'inherit',
          resize: 'vertical',
        }}
      />

      <div style={{ marginTop: 20, textAlign: 'right' }}>
        <button
          onClick={handleSave}
          disabled={!isDirty || isSaving || !skillRating || !softSkillRating}
          style={{
            padding: '12px 32px',
            fontSize: 16,
            fontWeight: 600,
            border: 'none',
            borderRadius: 12,
            background: isDirty && skillRating && softSkillRating ? '#6366f1' : '#94a3b8',
            color: 'white',
            cursor: isDirty && skillRating && softSkillRating ? 'pointer' : 'not-allowed',
            minWidth: 140,
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu đánh giá'}
        </button>
      </div>
    </div>
  );
};

export default InterviewPage;