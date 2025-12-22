// src/interviewHistory/pages/InterviewHistory.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import UserNavbar from '../../components/navbars/UserNavbar';

// Import CSS
import '../style/InterviewHistory.css';
import '../style/MyReviews.css'; 

function InterviewHistory({ defaultTab = 'history' }) {
    // === TAB STATE ===
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Update tab if prop changes (e.g. clicking Navbar links)
    useEffect(() => {
        setActiveTab(defaultTab);
    }, [defaultTab]);

    const [historyItems, setHistoryItems] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(true);
    const [selectedHistory, setSelectedHistory] = useState(null);
    const [historyMessages, setHistoryMessages] = useState([]);
    const [historyFeedback, setHistoryFeedback] = useState(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const userId = localStorage.getItem('userId');

    // Fetch History List
    useEffect(() => {
        if (activeTab !== 'history' || !userId) return;

        const loadHistory = async () => {
            try {
                setHistoryLoading(true);
                const res = await axios.get(API_ENDPOINTS.GET_INTERVIEW_HISTORY(userId), {
                    params: { limit: 100, offset: 0, include_active: true },
                    withCredentials: true
                });
                const sorted = (res.data?.items || []).sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setHistoryItems(sorted);
            } catch (err) {
                console.log('Error loading history');
            } finally {
                setHistoryLoading(false);
            }
        };
        loadHistory();
    }, [userId, activeTab]);

    // View History Detail
    const viewHistoryDetail = async (interview) => {
        try {
            const msgRes = await axios.get(
                API_ENDPOINTS.GET_AI_INTERVIEW_CONVERSATION(interview.id),
                { withCredentials: true }
            );
            setHistoryMessages(msgRes.data?.messages || []);

            try {
                const fbRes = await axios.put(
                    API_ENDPOINTS.STOP_AI_INTERVIEW(interview.id),
                    {},
                    { withCredentials: true }
                );
                setHistoryFeedback(fbRes.data);
            } catch (e) {
                setHistoryFeedback(null);
            }
            setSelectedHistory(interview);
        } catch (err) {
            console.log('Error viewing interview');
        }
    };

    // Share Function
    const handleQuickShare = async () => {
        if (!selectedHistory) return;
        setIsSharing(true);
        try {
            const questionCount = historyMessages.filter(m =>
                m.type === 'question' || m.type === 'followup'
            ).length;

            const title = selectedHistory.title && selectedHistory.title.trim() !== ''
                ? selectedHistory.title
                : `Mock Interview – ${new Date(selectedHistory.started_at).toLocaleDateString('vi-VN')} ${new Date(selectedHistory.started_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

            // Simple skill extraction logic
            const text = historyMessages.map(m => m.text).join(' ').toLowerCase();
            const commonSkills = ['java', 'spring', 'react', 'node', 'python', 'docker', 'aws', 'system design', 'sql'];
            const found = commonSkills.filter(skill => text.includes(skill));
            const skills = found.length > 0 ? found.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') : "General Coding";

            const response = await axios.post(
                API_ENDPOINTS.PEER_SHARE_INTERVIEW,
                {
                    InterviewSessionId: selectedHistory.id,
                    Title: title,
                    Skills: skills,
                    QuestionCount: questionCount
                },
                { withCredentials: true }
            );

            if (response.data?.status == 201) {
                alert('Đã chia sẻ thành công! Bạn có thể xem trong tab "Đánh giá của tôi".')
            }
        } catch (err) {
            console.error(err);
            alert('Có lỗi xảy ra khi chia sẻ.');
        } finally {
            setIsSharing(false);
        }
    };

    // Helpers for History
    const getHistoryStatusBadge = (status) => {
        const map = {
            COMPLETE: { bg: '#10b981', text: 'Hoàn thành' },
            EVALUATING: { bg: '#8b5cf6', text: 'Đang chấm điểm' },
            QUESTIONING: { bg: '#3b82f6', text: 'Đang phỏng vấn' },
            FOLLOW_UP: { bg: '#f59e0b', text: 'Follow-up' },
            IDLE: { bg: '#6c757d', text: 'Chưa bắt đầu' },
        };
        const s = map[status] || { bg: '#6b7280', text: status };
        return <span className="InterviewHistory-status-badge" style={{ background: s.bg }}>{s.text}</span>;
    };


    // ==========================================
    // LOGIC 2: MY REVIEWS (Original)
    // ==========================================
    const [sharedInterviews, setSharedInterviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const [reviewMessages, setReviewMessages] = useState([]); // Transcript for review view
    const [peerReviews, setPeerReviews] = useState([]); // The actual reviews
    
    // Owner Rating Modal State
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [currentSubmission, setCurrentSubmission] = useState(null);
    const [qualityRating, setQualityRating] = useState(5);
    const [ownerComment, setOwnerComment] = useState('');
    const [submittingRating, setSubmittingRating] = useState(false);

    // Fetch Shared List
    useEffect(() => {
        if (activeTab !== 'reviews') return;

        const fetchShared = async () => {
            try {
                setReviewsLoading(true);
                const res = await axios.get(API_ENDPOINTS.PEER_GET_MY_SHARED_INTERVIEWS, {
                    withCredentials: true
                });
                if (res.data.status === 200) {
                    setSharedInterviews(res.data.responseData || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchShared();
    }, [activeTab]);

    // View Review Detail
    const viewReviewDetail = async (item) => {
        try {
            // We use a separate loading state or just rely on main loading if needed. 
            // For now, simple transition.
            setSelectedReview(item);
            setReviewMessages([]);
            setPeerReviews([]);

            // 1. Get Transcript
            const convRes = await axios.get(
                API_ENDPOINTS.GET_AI_INTERVIEW_CONVERSATION(item.interviewSessionId),
                { withCredentials: true }
            );
            setReviewMessages(convRes.data?.messages || []);

            // 2. Get Reviews
            const reviewRes = await axios.get(
                API_ENDPOINTS.PEER_GET_REVIEWS_RECEIVED(item.id),
                { withCredentials: true }
            );

            if (reviewRes.data.status === 200) {
                const rawSubmissions = reviewRes.data.responseData.submissions || [];
                const enrichedSubmissions = await Promise.all(
                    rawSubmissions.map(async (sub) => {
                        const reviewerName = sub.reviewer?.name || 'Người dùng ẩn danh';
                        return { ...sub, reviewerName };
                    })
                );
                setPeerReviews(enrichedSubmissions);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Owner Rating Logic
    const openRatingModal = (submission) => {
        setCurrentSubmission(submission);
        setQualityRating(submission.myRating?.qualityRating || 5);
        setOwnerComment(submission.myRating?.comment || '');
        setRatingModalOpen(true);
    };

    const closeRatingModal = () => {
        setRatingModalOpen(false);
        setCurrentSubmission(null);
        setQualityRating(5);
        setOwnerComment('');
    };

    const submitOwnerRating = async () => {
        if (!currentSubmission || submittingRating) return;
        try {
            setSubmittingRating(true);
            const payload = {
                ReviewSubmissionId: currentSubmission.submissionId,
                QualityRating: qualityRating,
                Comment: ownerComment.trim() || null
            };
            const res = await axios.post(API_ENDPOINTS.PEER_OWNER_RATING, payload, { withCredentials: true });
            if (res.data.status === 200 || res.data.status === 201) {
                // Refresh reviews
                const reviewRes = await axios.get(
                    API_ENDPOINTS.PEER_GET_REVIEWS_RECEIVED(selectedReview.id),
                    { withCredentials: true }
                );
                if (reviewRes.data.status === 200) {
                    const rawSubmissions = reviewRes.data.responseData.submissions || [];
                    const enriched = await Promise.all(
                        rawSubmissions.map(async (sub) => ({
                            ...sub,
                            reviewerName: sub.reviewer?.name || 'Người dùng ẩn danh'
                        }))
                    );
                    setPeerReviews(enriched);
                }
                closeRatingModal();
            }
        } catch (err) {
            alert('Không thể gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setSubmittingRating(false);
        }
    };

    const getReviewStatusBadge = (status) => {
        const map = {
            open: { bg: '#10b981', text: 'Đang mở' },
            closed: { bg: '#dc3545', text: 'Đã đóng' },
        };
        const s = map[status] || { bg: '#6c757d', text: status };
        return <span className="MyReviews-status-badge" style={{ background: s.bg }}>{s.text}</span>;
    };

    // ==========================================
    // SHARED HELPERS
    // ==========================================
    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const renderMessages = (msgs) => {
        if (msgs.length === 0) return <p className="InterviewHistory-empty-text">Không có tin nhắn</p>;
        
        return msgs.map((msg, i) => {
            const isQuestion = msg.type === 'question' || msg.type === 'followup';
            // Use styles from InterviewHistory CSS for messages
            return (
                <div key={i} className={`InterviewHistory-message-row ${isQuestion ? 'ai' : 'user'}`}
                     style={{ alignSelf: isQuestion ? 'flex-start' : 'flex-end', maxWidth: '85%' }}>
                    <div className="InterviewHistory-message-bubble"
                         style={{
                             background: isQuestion ? '#2c313a' : '#0f8a57',
                             color: '#fff',
                             borderRadius: isQuestion ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                             boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                         }}>
                        {isQuestion && (
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#19c37d', marginBottom: '8px', textTransform: 'uppercase' }}>
                                {msg.type === 'followup' ? 'Follow-up' : 'Câu hỏi'}
                            </div>
                        )}
                        <div className="InterviewHistory-message-content">{msg.text || '(Không có nội dung)'}</div>
                        {isQuestion && msg.metadata?.audioData && (
                            <audio controls className="InterviewHistory-audio-player" style={{ marginTop: 12 }}>
                                <source src={`data:audio/wav;base64,${msg.metadata.audioData}`} type="audio/wav" />
                            </audio>
                        )}
                        {msg.is_voice && msg.audio_path && (
                            <audio controls className="InterviewHistory-audio-player" style={{ marginTop: 12, width: 240 }}>
                                <source src={msg.audio_path} />
                            </audio>
                        )}
                        <div className="InterviewHistory-timestamp">
                            {new Date(msg.timestamp || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>
            );
        });
    };

    // ==========================================
    // RENDER
    // ==========================================
    
    // 1. RENDER HISTORY DETAIL
    if (activeTab === 'history' && selectedHistory) {
        return (
            <div className="merged-history-page-wrapper">
                <UserNavbar />
                <div id="InterviewHistory-detail-page">
                    <div id="InterviewHistory-detail-container">
                        <div id="InterviewHistory-detail-header-card">
                            <button onClick={() => setSelectedHistory(null)} id="InterviewHistory-back-button">
                                <span className="material-icons">arrow_back</span> Quay lại danh sách
                            </button>
                            <h1 id="InterviewHistory-detail-title">{selectedHistory.title || 'Buổi phỏng vấn'}</h1>
                            <p id="InterviewHistory-detail-date-label">
                                {formatDate(selectedHistory.started_at)} → {formatDate(selectedHistory.completed_at)}
                            </p>
                        </div>

                        <div id="InterviewHistory-transcript-container">
                            <h2 id="InterviewHistory-transcript-header">Nội dung buổi phỏng vấn</h2>
                            <div className="InterviewHistory-messages-list">
                                {renderMessages(historyMessages)}
                            </div>
                        </div>

                        {historyFeedback && (
                            <div id="InterviewHistory-feedback-trigger-container">
                                <button onClick={() => setShowFeedbackModal(true)} id="InterviewHistory-feedback-button">
                                    Xem đánh giá chi tiết ({historyFeedback.overall_score?.toFixed(1) || 'N/A'}/100)
                                </button>
                            </div>
                        )}

                        {selectedHistory?.status === 'COMPLETE' && (
                            <div id="InterviewHistory-share-container">
                                <button onClick={handleQuickShare} disabled={isSharing} id="InterviewHistory-share-button">
                                    <span className="material-icons">share</span>
                                    {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ để nhận review từ cộng đồng'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Feedback Modal (Reuse existing modal logic) */}
                {showFeedbackModal && historyFeedback && (
                    <div id="InterviewHistory-modal-overlay" onClick={() => setShowFeedbackModal(false)}>
                        <div id="InterviewHistory-modal-card" onClick={e => e.stopPropagation()}>
                            <button id="InterviewHistory-modal-close-btn" onClick={() => setShowFeedbackModal(false)}>×</button>
                            <h2 id="InterviewHistory-modal-title">Đánh giá buổi phỏng vấn</h2>
                            <div id="InterviewHistory-modal-score-display">
                                {historyFeedback.overall_score?.toFixed(1) || 'N/A'}<small>/100</small>
                            </div>
                            <div id="InterviewHistory-modal-score-grid">
                                {historyFeedback.theoretical_score_avg !== undefined && (
                                    <div className="InterviewHistory-score-box">
                                        <span className="InterviewHistory-score-label">Kiến thức chuyên môn</span>
                                        <span className="InterviewHistory-score-value">{historyFeedback.theoretical_score_avg.toFixed(1)}</span>
                                    </div>
                                )}
                                {historyFeedback.speaking_score_avg !== undefined && (
                                    <div className="InterviewHistory-score-box">
                                        <span className="InterviewHistory-score-label">Giao tiếp</span>
                                        <span className="InterviewHistory-score-value">{historyFeedback.speaking_score_avg.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>
                            {/* Detailed feedback lists */}
                            {historyFeedback.strengths?.length > 0 && (
                                <div className="InterviewHistory-modal-section">
                                    <h3>Điểm mạnh</h3><ul>{historyFeedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                </div>
                            )}
                            {historyFeedback.weaknesses?.length > 0 && (
                                <div className="InterviewHistory-modal-section">
                                    <h3>Cần cải thiện</h3><ul>{historyFeedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
                                </div>
                            )}
                            {historyFeedback.study_recommendations?.length > 0 && (
                                <div className="InterviewHistory-modal-section">
                                    <h3>Gợi ý học tập</h3><ul>{historyFeedback.study_recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 2. RENDER REVIEW DETAIL
    if (activeTab === 'reviews' && selectedReview) {
        return (
            <div className="merged-history-page-wrapper">
                <UserNavbar />
                <div id="MyReviews-detail-page">
                    <div id="MyReviews-detail-container">
                        <button onClick={() => setSelectedReview(null)} id="MyReviews-back-btn">
                            <span className="material-icons">arrow_back</span> Quay lại danh sách
                        </button>
                        <div id="MyReviews-detail-header-card">
                            <h1 id="MyReviews-detail-title">{selectedReview.title}</h1>
                            <p className="MyReviews-detail-meta">
                                <strong>{selectedReview.questionCount}</strong> câu hỏi • 
                                <strong>{selectedReview.currentReviewerCount}</strong> người đã review • 
                                {getReviewStatusBadge(selectedReview.status)}
                            </p>
                            <p className="shared-date" style={{ color: '#888' }}>
                                Chia sẻ lúc: {formatDate(selectedReview.createdAt)}
                            </p>
                        </div>

                        {/* Transcript */}
                        <div id="MyReviews-transcript-container">
                            <h2 id="MyReviews-transcript-title">Nội dung buổi phỏng vấn</h2>
                            <div className="MyReviews-messages-list">
                                {renderMessages(reviewMessages)}
                            </div>
                        </div>

                        {/* Reviews List */}
                        <div id="MyReviews-reviews-section">
                            <h2 id="MyReviews-reviews-title">Đánh giá từ cộng đồng ({peerReviews.length} người)</h2>
                            {peerReviews.length === 0 ? (
                                <div className="MyReviews-empty-state">
                                    <span className="material-icons MyReviews-empty-icon">rate_review</span>
                                    <p>Chưa có ai review buổi này</p>
                                </div>
                            ) : (
                                <div className="MyReviews-reviews-grid">
                                    {peerReviews.map((sub) => (
                                        <div key={sub.submissionId} className="MyReviews-review-card">
                                            <div className="MyReviews-reviewer-header">
                                                <div className="MyReviews-reviewer-avatar">{sub.reviewerName.charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <h4 className="MyReviews-reviewer-name">{sub.reviewerName}</h4>
                                                    <p className="MyReviews-review-time">{formatDate(sub.submittedAt)}</p>
                                                </div>
                                            </div>

                                            {/* Owner Rating Action */}
                                            <div style={{ textAlign: 'right', margin: '12px 0' }}>
                                                {sub.myRating ? (
                                                    <div style={{ color: '#19c37d', fontWeight: '600' }}>
                                                        Bạn đã đánh giá: {sub.myRating.qualityRating} ⭐
                                                        {sub.myRating.comment && ' (với bình luận)'}
                                                    </div>
                                                ) : (
                                                    <button onClick={() => openRatingModal(sub)} className="MyReviews-rate-review-btn">
                                                        Đánh giá chất lượng review này
                                                    </button>
                                                )}
                                            </div>

                                            {/* Review Content */}
                                            <div className="MyReviews-rating-group">
                                                {sub.reviews.map((r, i) => (
                                                    <div key={r.id} className="MyReviews-rating-item">
                                                        <div className="MyReviews-question-label">Câu {i + 1}</div>
                                                        <div className="MyReviews-star-row">
                                                            <span className="MyReviews-rating-label">Technical:</span>
                                                            <div className="MyReviews-stars-container">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <span key={star} className="MyReviews-star-icon"
                                                                        style={{ color: star <= r.skillRating ? '#ffd700' : '#444' }}>★</span>
                                                                ))}
                                                            </div>
                                                            <span className="MyReviews-rating-value">{r.skillRating}/5</span>
                                                        </div>
                                                        <div className="MyReviews-star-row">
                                                            <span className="MyReviews-rating-label">Soft Skill:</span>
                                                            <div className="MyReviews-stars-container">
                                                                {[1, 2, 3, 4, 5].map(star => (
                                                                    <span key={star} className="MyReviews-star-icon"
                                                                        style={{ color: star <= r.softSkillRating ? '#19c37d' : '#444' }}>★</span>
                                                                ))}
                                                            </div>
                                                            <span className="MyReviews-rating-value">{r.softSkillRating}/5</span>
                                                        </div>
                                                        {r.comment && (
                                                            <div className="MyReviews-comment-box"><span className="MyReviews-quote-icon">“</span>{r.comment}</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Rating Modal */}
                {ratingModalOpen && currentSubmission && (
                    <div className="MyReviews-modal-overlay" onClick={closeRatingModal}>
                        <div className="MyReviews-modal-content" onClick={e => e.stopPropagation()}>
                            <h3>Đánh giá chất lượng review</h3>
                            <p><strong>Người review:</strong> {currentSubmission.reviewerName}</p>
                            <div style={{ margin: '24px 0' }}>
                                <label>Chất lượng review (1-5 sao)</label>
                                <div className="star-selector">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span key={star} onClick={() => setQualityRating(star)}
                                            style={{ color: star <= qualityRating ? '#ffd700' : '#ccc' }}>★</span>
                                    ))}
                                </div>
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <textarea value={ownerComment} onChange={(e) => setOwnerComment(e.target.value)}
                                    placeholder="Nhập bình luận..." rows={4} style={{ width: '100%', padding: '10px' }} />
                            </div>
                            <div style={{ textAlign: 'right', gap: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                                <button onClick={closeRatingModal}>Hủy</button>
                                <button onClick={submitOwnerRating} disabled={submittingRating}>{submittingRating ? 'Đang gửi...' : 'Gửi'}</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // 3. MAIN RENDER (Tabs & Lists)
    return (
        <div className="merged-history-page-wrapper">
            <header>
                <UserNavbar />
            </header>

            {/* TAB NAVIGATION */}
            <div className="ih-tabs-container">
                <button 
                    className={`ih-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    Lịch sử phỏng vấn
                </button>
                <button 
                    className={`ih-tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                    onClick={() => setActiveTab('reviews')}
                >
                    Phỏng vấn đã chia sẻ
                </button>
            </div>

            {/* TAB CONTENT: HISTORY LIST */}
            {activeTab === 'history' && (
                <div id="InterviewHistory-page">
                    <div id="InterviewHistory-container">
                        {historyLoading ? (
                            <div id="InterviewHistory-loading-state">
                                <span id="InterviewHistory-loading-icon" className="material-icons">hourglass_empty</span>
                                <p>Đang tải lịch sử...</p>
                            </div>
                        ) : historyItems.length === 0 ? (
                            <div id="InterviewHistory-empty-state">
                                <span id="InterviewHistory-empty-icon" className="material-icons">history</span>
                                <h3>Chưa có buổi phỏng vấn nào</h3>
                                <p>Hãy bắt đầu một buổi phỏng vấn mới để lưu vào lịch sử!</p>
                            </div>
                        ) : (
                            <div id="InterviewHistory-grid">
                                {historyItems.map((item) => (
                                    <div key={item.id} className="InterviewHistory-card-item" onClick={() => viewHistoryDetail(item)}>
                                        <div className="InterviewHistory-card-header">
                                            <h3 className="InterviewHistory-card-title">{item.title || 'Phỏng vấn không tiêu chuẩn'}</h3>
                                            {getHistoryStatusBadge(item.status)}
                                        </div>
                                        <div className="InterviewHistory-card-body">
                                            <p className="InterviewHistory-date-text"><strong>Bắt đầu:</strong> {formatDate(item.started_at)}</p>
                                            <p className="InterviewHistory-date-text"><strong>Kết thúc:</strong> {formatDate(item.completed_at) || 'Chưa kết thúc'}</p>
                                        </div>
                                        <div className="InterviewHistory-card-footer">
                                            <span className="view-text">Xem chi tiết</span>
                                            <span className="material-icons">chevron_right</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: REVIEWS LIST */}
            {activeTab === 'reviews' && (
                <div id="MyReviews-page">
                    <div id="MyReviews-container">
                        {reviewsLoading ? (
                            <div id="MyReviews-loading-state">
                                <span className="material-icons spin" style={{fontSize: 64, color: '#19c37d'}}>hourglass_empty</span>
                                <p>Đang tải...</p>
                            </div>
                        ) : sharedInterviews.length === 0 ? (
                            <div className="MyReviews-empty-state">
                                <span className="material-icons MyReviews-empty-icon">share</span>
                                <h3>Chưa chia sẻ buổi nào</h3>
                                <p>Vào tab Lịch sử → bấm "Chia sẻ để nhận review"</p>
                            </div>
                        ) : (
                            <div id="MyReviews-grid">
                                {sharedInterviews.map((item) => (
                                    <div key={item.id} className="MyReviews-shared-card" onClick={() => viewReviewDetail(item)}>
                                        <div className="MyReviews-card-header">
                                            <h3>{item.title}</h3>
                                            {getReviewStatusBadge(item.status)}
                                        </div>
                                        <div className="MyReviews-card-body">
                                            <p><strong>Kỹ năng:</strong> {item.skills}</p>
                                            <p><strong>Số câu hỏi:</strong> {item.questionCount}</p>
                                            <p><strong>Đã review:</strong> {item.currentReviewerCount} người</p>
                                            <p><strong>Chia sẻ:</strong> {formatDate(item.createdAt)}</p>
                                        </div>
                                        <div className="MyReviews-card-action">
                                            Xem buổi + đánh giá
                                            <span className="material-icons">chevron_right</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default InterviewHistory;