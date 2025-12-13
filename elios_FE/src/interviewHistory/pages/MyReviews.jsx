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

    // Lấy danh sách buổi đã chia sẻ
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

    // Xem chi tiết buổi + transcript + đánh giá
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

            // === THAY THẾ ĐOẠN NÀY TRONG viewSharedInterview ===
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
                                    reviewerName = (userRes.data?.data.firstName + userRes.data?.data.lastName) ||
                                        'Người dùng ẩn danh';
                                } catch (err) {
                                    console.warn('Không lấy được tên reviewer:', reviewerId);
                                    reviewerName = 'Người dùng ẩn danh';
                                }
                            } else {
                                reviewerName = 'Người dùng ẩn danh';
                            }

                            return {
                                ...sub,
                                reviewerName
                            };
                        })
                    );

                    setReviews(enrichedSubmissions);
                } else {
                    setReviews([]);
                }
            } catch (e) {
                console.log('Chưa có ai review buổi này');
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
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const map = {
            open: { bg: '#10b981', text: 'Đang mở' },
            closed: { bg: '#ef4444', text: 'Đã đóng' },
        };
        const s = map[status] || { bg: '#6b7280', text: status };
        return <span className="status-badge" style={{ background: s.bg }}>{s.text}</span>;
    };

    // ==================== CHI TIẾT BUỔI ĐÃ CHIA SẺ ====================
    if (selectedInterview) {
        return (
            <div className="myreviews-detail">
                <div className="detail-container">
                    {/* Header */}
                    <button onClick={() => setSelectedInterview(null)} className="back-btn">
                        <span className="material-icons">arrow_back</span>
                        Quay lại danh sách
                    </button>

                    <div className="detail-header">
                        <h1>{selectedInterview.title}</h1>
                        <p className="detail-meta">
                            <strong>{selectedInterview.questionCount}</strong> câu hỏi •
                            <strong>{selectedInterview.currentReviewerCount}</strong> người đã review •
                            {getStatusBadge(selectedInterview.status)}
                        </p>
                        <p className="shared-date">
                            Chia sẻ lúc: {formatDate(selectedInterview.createdAt)}
                        </p>
                    </div>

                    {/* Transcript */}
                    <div className="transcript-card">
                        <h2 className="section-title">Nội dung buổi phỏng vấn</h2>
                        <div className="messages-list">
                            {messages.length === 0 ? (
                                <p className="empty-msg">Không có tin nhắn</p>
                            ) : (
                                messages.map((msg, i) => {
                                    const isQuestion = msg.type === 'question' || msg.type === 'followup';
                                    return (
                                        <div
                                            key={i}
                                            className={`message ${isQuestion ? 'ai' : 'user'}`}
                                            style={{ alignSelf: isQuestion ? 'flex-start' : 'flex-end' }}
                                        >
                                            <div
                                                className="bubble"
                                                style={{
                                                    background: isQuestion
                                                        ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
                                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                    color: isQuestion ? '#1e293b' : 'white',
                                                    borderRadius: isQuestion
                                                        ? '20px 20px 20px 4px'
                                                        : '20px 20px 4px 20px',
                                                }}
                                            >
                                                {isQuestion && (
                                                    <div style={{
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#6366f1',
                                                        marginBottom: '8px',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {msg.type === 'followup' ? 'Follow-up' : 'Câu hỏi'}
                                                    </div>
                                                )}
                                                <div className="content">{msg.text || '(Không có nội dung)'}</div>

                                                {/* Audio */}
                                                {msg.metadata?.audioData && (
                                                    <audio controls className="audio-player">
                                                        <source src={`data:audio/wav;base64,${msg.metadata.audioData}`} />
                                                    </audio>
                                                )}
                                                {msg.is_voice && msg.audio_path && (
                                                    <audio controls className="audio-player" style={{ width: 240 }}>
                                                        <source src={msg.audio_path} />
                                                    </audio>
                                                )}

                                                <div className="timestamp">
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
                    <div className="reviews-section" style={{marginTop:20}}>
                        <h2 className="section-title">
                            Đánh giá từ cộng đồng ({reviews.length} người)
                        </h2>
                        {reviews.length === 0 ? (
                            <div className="empty-review">
                                <span className="material-icons">rate_review</span>
                                <p>Chưa có ai review buổi này</p>
                            </div>
                        ) : (
                            <div className="reviews-grid">
                                {reviews.map((sub) => (
                                    <div key={sub.submissionId} className="review-card">
                                        <div className="reviewer-header">
                                            <div className="avatar">{sub.reviewerName.charAt(0)}</div>
                                            <div>
                                                <h4>{sub.reviewerName}</h4>
                                                <p className="review-time">{formatDate(sub.submittedAt)}</p>
                                            </div>
                                        </div>
                                        <div className="review-ratings">
                                            {sub.reviews.map((r, i) => (
                                                <div key={i} className="rating-item">
                                                    <div className="question-label">
                                                        Câu {i + 1}
                                                    </div>

                                                    {/* Technical Skill Rating */}
                                                    <div className="star-rating">
                                                        <span className="rating-title">Technical:</span>
                                                        <div className="stars">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span
                                                                    key={star}
                                                                    className="star"
                                                                    style={{
                                                                        color: star <= r.skillRating ? '#fbbf24' : '#e2e8f0',
                                                                        fontSize: '20px'
                                                                    }}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="rating-value">{r.skillRating}/5</span>
                                                    </div>

                                                    {/* Soft Skill Rating */}
                                                    <div className="star-rating">
                                                        <span className="rating-title">Soft Skill:</span>
                                                        <div className="stars">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <span
                                                                    key={star}
                                                                    className="star"
                                                                    style={{
                                                                        color: star <= r.softSkillRating ? '#10b981' : '#e2e8f0',
                                                                        fontSize: '20px'
                                                                    }}
                                                                >
                                                                    ★
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="rating-value">{r.softSkillRating}/5</span>
                                                    </div>

                                                    {/* Comment */}
                                                    {r.comment && (
                                                        <div className="review-comment">
                                                            <span className="quote-icon">“</span>
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
        <div className="myreviews-page">
            <div className="page-header">
                <h1>Buổi phỏng vấn tôi đã chia sẻ</h1>
                <p>Xem transcript và đánh giá từ cộng đồng</p>
            </div>

            <div className="container">
                {loading ? (
                    <div className="loading">
                        <span className="material-icons spin">hourglass_empty</span>
                        <p>Đang tải...</p>
                    </div>
                ) : sharedInterviews.length === 0 ? (
                    <div className="empty-state">
                        <span className="material-icons">share</span>
                        <h3>Chưa chia sẻ buổi nào</h3>
                        <p>Vào Lịch sử → bấm "Chia sẻ để nhận review"</p>
                    </div>
                ) : (
                    <div className="shared-grid">
                        {sharedInterviews.map((item) => (
                            <div
                                key={item.id}
                                className="shared-card"
                                onClick={() => viewSharedInterview(item)}
                            >
                                <div className="card-header" style={{padding:20}}>
                                    <h3>{item.title}</h3>
                                    {getStatusBadge(item.status)}
                                </div>
                                <div className="card-body" style={{padding:20}}>
                                    <p><strong>Kỹ năng:</strong> {item.skills}</p>
                                    <p><strong>Số câu hỏi:</strong> {item.questionCount}</p>
                                    <p><strong>Đã review:</strong> {item.currentReviewerCount} người</p>
                                    <p><strong>Chia sẻ:</strong> {formatDate(item.createdAt)}</p>
                                </div>
                                <div className="card-action">
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