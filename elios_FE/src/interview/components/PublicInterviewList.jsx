// src/interview/components/PublicInterviewList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import toast from '../utils/toast';
import { useInterview } from '../context/InterviewContext';

export default function PublicInterviewList(isLoadingPublic, isReviewing) {
    const { setInterviewSessionId, setIsReviewing } = useInterview();
    const [publicInterviews, setPublicInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const res = await axios.get(API_ENDPOINTS.PEER_BROWSE_PUBLIC_POOL, { withCredentials: true });
                if (res.data.status === 200) {
                    setPublicInterviews(res.data.responseData || []);
                }
            } catch (err) {
                toast.error('Lỗi tải danh sách');
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    const handleStartReview = (sessionId) => {
        setInterviewSessionId(sessionId);
        setIsReviewing(true);
    };

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
}