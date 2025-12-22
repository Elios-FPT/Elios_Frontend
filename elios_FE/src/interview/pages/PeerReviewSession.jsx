// src/interview/pages/PeerReviewSession.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from '../utils/toast';
import { API_ENDPOINTS } from '../../api/apiConfig';
import ReviewItem from '../components/ReviewItem';
import { useInterview } from '../context/InterviewContext';
import { useNavigate } from 'react-router-dom';

export default function PeerReviewSession() {
  const navigate = useNavigate();

  const {
    interviewSessionId,
    submissionId,
    setSubmissionId,
    reviewProgress,
    setReviewProgress,
    conversationMessages,
    setConversationMessages,
    setIsReviewing,
    setInterviewSessionId,
  } = useInterview();

  // Các state nội bộ chỉ dùng cho Peer Review
  const [publicInterviews, setPublicInterviews] = useState([]);
  const [isProgressLoading, setIsProgressLoading] = useState(false);
  const [savingQuestionId, setSavingQuestionId] = useState(null);

  const fetchInterviewConversation = async (sessionId) => {
    try {
      const response = await axios.get(
        API_ENDPOINTS.GET_AI_INTERVIEW_CONVERSATION(sessionId),
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

  const fetchPublicInterviews = async () => {
    try {
      const response = await axios.get(API_ENDPOINTS.PEER_BROWSE_PUBLIC_POOL, { withCredentials: true });
      if (response.data.status === 200) {
        setPublicInterviews(response.data.responseData || []);
      }
    } catch (err) {
      toast.error('Lỗi tải danh sách review');
    }
  };

  useEffect(() => {
    if (interviewSessionId) {
      const loadReviewData = async () => {
        try {
          // Lấy conversation
          await fetchInterviewConversation(interviewSessionId);

          // Lấy danh sách public để tìm draft cũ
          await fetchPublicInterviews();

          // Lấy chi tiết interview (nếu cần)
          const detailRes = await axios.get(API_ENDPOINTS.GET_AI_INTERVIEW_DETAIL(interviewSessionId), {
            withCredentials: true,
          });

          const publicItem = publicInterviews.find(i => i.interviewSessionId === interviewSessionId);

          if (publicItem?.myDraft?.id) {
            setSubmissionId(publicItem.myDraft.id);
            await fetchReviewProgress(publicItem.myDraft.id);
            toast.success('Tiếp tục review draft của bạn');
          } else {
            // Bắt đầu review mới
            const startRes = await axios.post(
              API_ENDPOINTS.PEER_START_REVIEW,
              { sharedInterviewId: publicItem?.id },
              { withCredentials: true }
            );

            if (startRes.data.status === 409) {
              alert('Bạn đã hoàn thành review này rồi!');
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
          }
        } catch (err) {
          toast.error(err.response?.data?.message || 'Không thể tải dữ liệu review');
          setIsReviewing(false);
          navigate('/interview');
        }
      };

      loadReviewData();
    }
  }, [interviewSessionId]);

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
        await fetchReviewProgress(submissionId);
        toast.success('Đã lưu câu này!', { duration: 2000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Lưu thất bại');
    } finally {
      setTimeout(() => setSavingQuestionId(null), 800);
    }
  };

  // ==================== SUBMIT & DELETE ====================
  const handleSubmitReview = async () => {
    if (!submissionId) return;
    try {
      const res = await axios.post(API_ENDPOINTS.PEER_SUBMIT_REVIEW(submissionId), {}, { withCredentials: true });
      if (res.data.status === 200) {
        toast.success('Submit review thành công! Cảm ơn bạn!');
        resetReviewState();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi submit');
    }
  };

  const handleDeleteDraft = async () => {
    if (!submissionId) return;
    try {
      await axios.delete(API_ENDPOINTS.PEER_DELETE_DRAFT(submissionId), { withCredentials: true });
      toast.success('Đã xóa draft và thoát.');
      resetReviewState();
    } catch (err) {
      toast.error('Lỗi xóa draft');
    }
  };

  const resetReviewState = () => {
    setIsReviewing(false);
    setSubmissionId(null);
    setReviewProgress(null);
    setConversationMessages([]);
    setInterviewSessionId(null);
    navigate('/interview');
  };

  const buildReviewableItems = () => {
    if (!conversationMessages.length || !reviewProgress) return [];

    const questionsMap = {};
    const answersByQuestion = {};

    conversationMessages.forEach((msg) => {
      if (msg.type === 'question' || msg.type === 'followup') {
        const qId = msg.id;
        questionsMap[qId] = msg;
        answersByQuestion[qId] = answersByQuestion[qId] || [];
      } else if (msg.type === 'answer') {
        const targetId = msg.follow_up_question_id || msg.question_id;
        if (targetId) {
          answersByQuestion[targetId] = answersByQuestion[targetId] || [];
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
        const savedReview = reviewProgress.reviews?.find(r => r.questionId === qId) || {
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

  if (!reviewProgress) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Đang tải dữ liệu review...</div>;
  }

  return (
    <div id="interview-page">
      <div id="interview-container">
        <div className="header">
          <h1 className="header-title">Peer Review Session</h1>
        </div>

        <div className="main-content">
          <div className="review-container">
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
          </div>
        </div>
      </div>
    </div>
  );
}