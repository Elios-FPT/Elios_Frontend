import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../style/MyReviews.css';

function MyReviews() {
    const [sharedInterviews, setSharedInterviews] = useState([]);
    const [selectedInterview, setSelectedInterview] = useState(null);
    const [messages, setMessages] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingDetail, setLoadingDetail] = useState(false);

    // ... (logic remains the same) ...
    useEffect(() => {
        const fetchShared = async () => {
            try {
                setLoading(true);
                const res = await axios.get(API_ENDPOINTS.PEER_GET_MY_SHARED_INTERVIEWS, {
                    withCredentials: true
                });

                if (res.data.status === 200) {
                    setSharedInterviews(res.data.responseData || []);
                }
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        fetchShared();
    }, []);

    const viewSharedInterview = async (item) => {
        try {
            setLoadingDetail(true);
            setSelectedInterview(item);
            setMessages([]);
            setReviews([]);

            const convRes = await axios.get(
                API_ENDPOINTS.GET_AI_INTERVIEW_CONVERSATION(item.interviewSessionId),
                { withCredentials: true }
            );
            setMessages(convRes.data?.messages || []);

            try {
                const reviewRes = await axios.get(
                    API_ENDPOINTS.PEER_GET_REVIEWS_RECEIVED(item.id),
                    { withCredentials: true }
                );
                if (reviewRes.data.status === 200) {
                    const rawSubmissions = reviewRes.data.responseData.submissions || [];
                    const enrichedSubmissions = await Promise.all(
                        rawSubmissions.map(async (sub) => {
                            const reviewerId = sub.reviewer?.id || sub.reviewerId;
                            let reviewerName = 'Đang tải...';
                            if (reviewerId) {
                                try {
                                    const userRes = await axios.get(
                                        API_ENDPOINTS.GET_USER_BY_ID(reviewerId),
                                        { withCredentials: true }
                                    );
                                    reviewerName = (userRes.data?.data.firstName + userRes.data?.data.lastName) || 'Người dùng ẩn danh';
                                } catch (err) {
                                    reviewerName = 'Người dùng ẩn danh';
                                }
                            } else {
                                reviewerName = 'Người dùng ẩn danh';
                            }
                            return { ...sub, reviewerName };
                        })
                    );
                    setReviews(enrichedSubmissions);
                } else {
                    setReviews([]);
                }
            } catch (e) {
                setReviews([]);
            }

        } catch (err) {
        } finally {
            setLoadingDetail(false);
        }
    };

    const formatDate = (d) => {
        if (!d) return '—';
        return new Date(d).toLocaleString('vi-VN', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const map = {
            open: { bg: '#10b981', text: 'Đang mở' },
            closed: { bg: '#dc3545', text: 'Đã đóng' },
        };
        const s = map[status] || { bg: '#6c757d', text: status };
        return <span className="MyReviews-status-badge" style={{ background: s.bg }}>{s.text}</span>;
    };

    // ==================== CHI TIẾT BUỔI ĐÃ CHIA SẺ ====================
    if (selectedInterview) {
        return (
            <div id="MyReviews-detail-page">
                <div id="MyReviews-detail-container">
                    {/* Header */}
                    <button onClick={() => setSelectedInterview(null)} id="MyReviews-back-btn">
                        <span className="material-icons">arrow_back</span>
                        Quay lại danh sách
                    </button>

                    <div id="MyReviews-detail-header-card">
                        <h1 id="MyReviews-detail-title">{selectedInterview.title}</h1>
                        <p className="MyReviews-detail-meta">
                            <strong>{selectedInterview.questionCount}</strong> câu hỏi •
                            <strong>{selectedInterview.currentReviewerCount}</strong> người đã review •
                            {getStatusBadge(selectedInterview.status)}
                        </p>
                        <p className="shared-date" style={{color: '#888'}}>
                            Chia sẻ lúc: {formatDate(selectedInterview.createdAt)}
                        </p>
                    </div>

                    {/* Transcript */}
                    <div id="MyReviews-transcript-container">
                        <h2 id="MyReviews-transcript-title">Nội dung buổi phỏng vấn</h2>
                        <div className="MyReviews-messages-list">
                            {messages.length === 0 ? (
                                <p className="MyReviews-empty-state">Không có tin nhắn</p>
                            ) : (
                                messages.map((msg, i) => {
                                    const isQuestion = msg.type === 'question' || msg.type === 'followup';
                                    return (
                                        <div
                                            key={i}
                                            className={`MyReviews-message-row ${isQuestion ? 'ai' : 'user'}`}
                                            style={{ alignSelf: isQuestion ? 'flex-start' : 'flex-end' }}
                                        >
                                            <div
                                                className="MyReviews-message-bubble"
                                                style={{
                                                    // === THEME UPDATE: Dark Bubble Colors ===
                                                    background: isQuestion
                                                        ? '#2c313a' // Dark Gray for AI
                                                        : '#0f8a57', // Green for User
                                                    color: '#fff',
                                                    borderRadius: isQuestion
                                                        ? '20px 20px 20px 4px'
                                                        : '20px 20px 4px 20px',
                                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                {isQuestion && (
                                                    <div style={{
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#19c37d',
                                                        marginBottom: '8px',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {msg.type === 'followup' ? 'Follow-up' : 'Câu hỏi'}
                                                    </div>
                                                )}
                                                <div className="MyReviews-message-content">{msg.text || '(Không có nội dung)'}</div>

                                                {/* Audio */}
                                                {msg.metadata?.audioData && (
                                                    <audio controls className="MyReviews-audio-player">
                                                        <source src={`data:audio/wav;base64,${msg.metadata.audioData}`} />
                                                    </audio>
                                                )}
                                                {msg.is_voice && msg.audio_path && (
                                                    <audio controls className="MyReviews-audio-player" style={{ width: 240 }}>
                                                        <source src={msg.audio_path} />
                                                    </audio>
                                                )}

                                                <div className="MyReviews-message-timestamp">
                                                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Đánh giá nhận được */}
                    <div id="MyReviews-reviews-section">
                        <h2 id="MyReviews-reviews-title">
                            Đánh giá từ cộng đồng ({reviews.length} người)
                        </h2>
                        {reviews.length === 0 ? (
                            <div className="MyReviews-empty-state">
                                <span className="material-icons MyReviews-empty-icon">rate_review</span>
                                <p>Chưa có ai review buổi này</p>
                            </div>
                        ) : (
                            <div className="MyReviews-reviews-grid">
                                {reviews.map((sub) => (
                                    <div key={sub.submissionId} className="MyReviews-review-card">
                                        <div className="MyReviews-reviewer-header">
                                            <div className="MyReviews-reviewer-avatar">{sub.reviewerName.charAt(0)}</div>
                                            <div>
                                                <h4 className="MyReviews-reviewer-name">{sub.reviewerName}</h4>
                                                <p className="MyReviews-review-time">{formatDate(sub.submittedAt)}</p>
                                            </div>
                                        </div>
                                        <div className="MyReviews-rating-group">
                                            {sub.reviews.map((r, i) => (
                                                <div key={i} className="MyReviews-rating-item">
                                                    <div className="MyReviews-question-label">
                                                        Câu {i + 1}
                                                    </div>

                                                    {/* Technical Skill Rating */}
                                                    <div className="MyReviews-star-row">
                                                        <span className="MyReviews-rating-label">Technical:</span>
                                                        <div className="MyReviews-stars-container">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span
                                                                    key={star}
                                                                    className="MyReviews-star-icon"
                                                                    style={{
                                                                        color: star <= r.skillRating ? '#ffd700' : '#444',
                                                                        fontSize: '20px'
                                                                    }}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="MyReviews-rating-value">{r.skillRating}/5</span>
                                                    </div>

                                                    {/* Soft Skill Rating */}
                                                    <div className="MyReviews-star-row">
                                                        <span className="MyReviews-rating-label">Soft Skill:</span>
                                                        <div className="MyReviews-stars-container">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span
                                                                    key={star}
                                                                    className="MyReviews-star-icon"
                                                                    style={{
                                                                        color: star <= r.softSkillRating ? '#19c37d' : '#444',
                                                                        fontSize: '20px'
                                                                    }}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="MyReviews-rating-value">{r.softSkillRating}/5</span>
                                                    </div>

                                                    {/* Comment */}
                                                    {r.comment && (
                                                        <div className="MyReviews-comment-box">
                                                            <span className="MyReviews-quote-icon">“</span>
                                                            {r.comment}
                                                        </div>
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
        );
    }

    // ==================== DANH SÁCH BUỔI ĐÃ CHIA SẺ ====================
    return (
        <div id="MyReviews-page">
            <div id="MyReviews-page-header">
                <h1 id="MyReviews-main-title">Buổi phỏng vấn tôi đã chia sẻ</h1>
                <p id="MyReviews-sub-title">Xem transcript và đánh giá từ cộng đồng</p>
            </div>

            <div id="MyReviews-container">
                {loading ? (
                    <div id="MyReviews-loading-state">
                        <span className="material-icons spin">hourglass_empty</span>
                        <p>Đang tải...</p>
                    </div>
                ) : sharedInterviews.length === 0 ? (
                    <div className="MyReviews-empty-state">
                        <span className="material-icons MyReviews-empty-icon">share</span>
                        <h3>Chưa chia sẻ buổi nào</h3>
                        <p>Vào Lịch sử → bấm "Chia sẻ để nhận review"</p>
                    </div>
                ) : (
                    <div id="MyReviews-grid">
                        {sharedInterviews.map((item) => (
                            <div
                                key={item.id}
                                className="MyReviews-shared-card"
                                onClick={() => viewSharedInterview(item)}
                            >
                                <div className="MyReviews-card-header">
                                    <h3>{item.title}</h3>
                                    {getStatusBadge(item.status)}
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
    );
}

export default MyReviews;