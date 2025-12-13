import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../style/InterviewHistory.css';

function InterviewHistory() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const userId = localStorage.getItem('userId');

    const [isSharing, setIsSharing] = useState(false);

    const handleQuickShare = async () => {
        if (!selected) return;

        setIsSharing(true);

        try {
            const questionCount = messages.filter(m =>
                m.type === 'question' || m.type === 'followup'
            ).length;

            const title = selected.title && selected.title.trim() !== ''
                ? selected.title
                : `Mock Interview – ${new Date(selected.started_at).toLocaleDateString('vi-VN')} ${new Date(selected.started_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;

            const skills = extractSkillsFromMessages(messages) || "Java, Spring Boot, System Design, Problem Solving";

            const response = await axios.post(
                API_ENDPOINTS.PEER_SHARE_INTERVIEW,
                {
                    InterviewSessionId: selected.id,
                    Title: title,
                    Skills: skills,
                    QuestionCount: questionCount
                },
                { withCredentials: true }
            );

            if (response.data?.status == 201) {
                alert('Đã chia sẻ thành công!')
            } else {
            }

        } catch (err) {
            const msg = err.response?.data?.message || 'Không thể chia sẻ buổi phỏng vấn';
        } finally {
            setIsSharing(false);
        }
    };

    const extractSkillsFromMessages = (msgs) => {
        const text = msgs.map(m => m.text).join(' ').toLowerCase();
        const commonSkills = ['java', 'spring', 'react', 'node', 'python', 'docker', 'aws', 'system design', 'algorithm'];
        const found = commonSkills.filter(skill => text.includes(skill));
        return found.length > 0 ? found.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') : null;
    };

    useEffect(() => {
        if (!userId) {
            console.log('Vui lòng đăng nhập');
            setLoading(false);
            return;
        }

        const loadHistory = async () => {
            try {
                setLoading(true);
                const res = await axios.get(API_ENDPOINTS.GET_INTERVIEW_HISTORY(userId), {
                    params: { limit: 100, offset: 0, include_active: true },
                    withCredentials: true
                });

                const sorted = (res.data?.items || []).sort(
                    (a, b) => new Date(b.created_at) - new Date(a.created_at)
                );
                setInterviews(sorted);
            } catch (err) {
                console.log('Không thể tải lịch sử phỏng vấn');
            } finally {
                setLoading(false);
            }
        };

        loadHistory();
    }, [userId]);

    const viewInterview = async (interview) => {
        try {
            console.log('Đang tải buổi phỏng vấn...');

            const msgRes = await axios.get(
                API_ENDPOINTS.GET_AI_INTERVIEW_CONVERSATION(interview.id),
                { withCredentials: true }
            );
            setMessages(msgRes.data?.messages || []);

            try {
                const fbRes = await axios.put(
                    API_ENDPOINTS.STOP_AI_INTERVIEW(interview.id),
                    {},
                    { withCredentials: true }
                );
                setFeedback(fbRes.data);
            } catch (e) {
                setFeedback(null);
            }

            setSelected(interview);
            console.log('Đã tải xong!');
        } catch (err) {
            console.log('Lỗi khi tải buổi phỏng vấn');
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
            COMPLETE: { bg: '#10b981', text: 'Hoàn thành' },
            EVALUATING: { bg: '#8b5cf6', text: 'Đang chấm điểm' },
            QUESTIONING: { bg: '#3b82f6', text: 'Đang phỏng vấn' },
            FOLLOW_UP: { bg: '#f59e0b', text: 'Follow-up' },
            IDLE: { bg: '#94a3b8', text: 'Chưa bắt đầu' },
        };
        const s = map[status] || { bg: '#6b7280', text: status };
        return <span className="status-badge" style={{ background: s.bg }}>{s.text}</span>;
    };

    // ==================== CHI TIẾT BUỔI ====================
    if (selected) {
        return (
            <div className="history-detail-page">
                <div className="detail-container">
                    {/* Header */}
                    <div className="detail-header">
                        <button onClick={() => setSelected(null)} className="back-button">
                            <span className="material-icons">arrow_back</span>
                            Quay lại danh sách
                        </button>
                        <h1 className="detail-title">{selected.title || 'Buổi phỏng vấn'}</h1>
                        <p className="detail-date">
                            {formatDate(selected.started_at)} → {formatDate(selected.completed_at) || 'Chưa kết thúc'}
                        </p>
                    </div>

                    {/* Transcript */}
                    <div className="transcript-card">
                        <h2 className="transcript-title">Nội dung buổi phỏng vấn</h2>
                        <div className="messages-list">
                            {messages.length === 0 ? (
                                <p className="empty-msg">Không có tin nhắn</p>
                            ) : (
                                messages.map((msg, i) => {
                                    // Xác định loại tin nhắn
                                    const isQuestion = msg.type === 'question' || msg.type === 'followup';
                                    const isAnswer = msg.type === 'answer';

                                    return (
                                        <div
                                            key={i}
                                            className={`message ${isQuestion ? 'ai' : 'user'}`}
                                            style={{
                                                alignSelf: isQuestion ? 'flex-start' : 'flex-end',
                                                maxWidth: '80%'
                                            }}
                                        >
                                            <div
                                                className="bubble"
                                                style={{
                                                    background: isQuestion
                                                        ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)' // Màu xám nhạt cho AI
                                                        : 'linear-gradient(135deg, #6366f1, #8b5cf6)',   // Màu tím cho user
                                                    color: isQuestion ? '#1e293b' : 'white',
                                                    borderRadius: isQuestion
                                                        ? '20px 20px 20px 4px'
                                                        : '20px 20px 4px 20px',
                                                    padding: '16px 20px',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {/* Tiêu đề nhỏ nếu là câu hỏi */}
                                                {isQuestion && (
                                                    <div style={{
                                                        fontSize: '13px',
                                                        fontWeight: 600,
                                                        color: '#6366f1',
                                                        marginBottom: '8px',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {msg.type === 'followup' ? 'Follow-up' : 'Câu hỏi'}
                                                    </div>
                                                )}

                                                {/* Nội dung */}
                                                <div className="content">
                                                    {msg.text || '(Không có nội dung văn bản)'}
                                                </div>

                                                {/* Audio cho câu hỏi (AI nói) */}
                                                {isQuestion && msg.metadata?.audioData && (
                                                    <audio controls className="audio-player" style={{ marginTop: 12 }}>
                                                        <source src={`data:audio/wav;base64,${msg.metadata.audioData}`} type="audio/wav" />
                                                        Trình duyệt không hỗ trợ audio.
                                                    </audio>
                                                )}

                                                {/* Audio cho câu trả lời (người dùng nói) */}
                                                {isAnswer && msg.is_voice && msg.audio_path && (
                                                    <audio controls className="audio-player" style={{ marginTop: 12, width: 240 }}>
                                                        <source src={msg.audio_path} />
                                                        Trình duyệt không hỗ trợ audio.
                                                    </audio>
                                                )}

                                                {/* Thời gian */}
                                                <div className="timestamp" style={{
                                                    fontSize: '12px',
                                                    opacity: 0.8,
                                                    marginTop: '10px',
                                                    textAlign: 'right'
                                                }}>
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

                    {/* Feedback Button */}
                    {feedback && (
                        <div className="feedback-trigger">
                            <button onClick={() => setShowFeedback(true)} className="feedback-button">
                                Xem đánh giá chi tiết ({feedback.overall_score?.toFixed(1) || 'N/A'}/100)
                            </button>
                        </div>
                    )}

                    {selected?.status === 'COMPLETE' && (
                        <div className="share-section">
                            <button
                                onClick={handleQuickShare}
                                disabled={isSharing}
                                className="share-button"
                            >
                                <span className="material-icons">share</span>
                                {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ để nhận review từ cộng đồng'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Feedback Modal */}
                {showFeedback && feedback && (
                    <div className="modal-overlay" onClick={() => setShowFeedback(false)}>
                        <div className="modal-card" onClick={e => e.stopPropagation()}>
                            <button className="modal-close" onClick={() => setShowFeedback(false)}>×</button>
                            <h2 className="modal-title">Đánh giá buổi phỏng vấn</h2>
                            <div className="overall-score">
                                {feedback.overall_score?.toFixed(1) || 'N/A'}<small>/100</small>
                            </div>

                            <div className="score-grid">
                                {feedback.theoretical_score_avg !== undefined && (
                                    <div className="score-item">
                                        <span className="label">Kiến thức chuyên môn</span>
                                        <span className="value">{feedback.theoretical_score_avg.toFixed(1)}</span>
                                    </div>
                                )}
                                {feedback.speaking_score_avg !== undefined && (
                                    <div className="score-item">
                                        <span className="label">Giao tiếp</span>
                                        <span className="value">{feedback.speaking_score_avg.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            {feedback.strengths?.length > 0 && (
                                <div className="section">
                                    <h3>Điểm mạnh</h3>
                                    <ul>
                                        {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}

                            {feedback.weaknesses?.length > 0 && (
                                <div className="section">
                                    <h3>Cần cải thiện</h3>
                                    <ul>
                                        {feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            )}

                            {feedback.study_recommendations?.length > 0 && (
                                <div className="section">
                                    <h3>Gợi ý học tập</h3>
                                    <ul>
                                        {feedback.study_recommendations.map((r, i) => <li key={i}>{r}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ==================== DANH SÁCH LỊCH SỬ ====================
    return (
        <div className="history-page">
            <div className="history-header">
                <h1 className="page-title">Lịch sử phỏng vấn</h1>
                <p className="page-subtitle">Xem lại các buổi phỏng vấn bạn đã thực hiện</p>
            </div>

            <div className="history-container">
                {loading ? (
                    <div className="loading-state">
                        <span className="material-icons spin">hourglass_empty</span>
                        <p>Đang tải lịch sử...</p>
                    </div>
                ) : interviews.length === 0 ? (
                    <div className="empty-state">
                        <span className="material-icons">history</span>
                        <h3>Chưa có buổi phỏng vấn nào</h3>
                        <p>Hãy bắt đầu một buổi phỏng vấn mới để lưu vào lịch sử!</p>
                    </div>
                ) : (
                    <div className="history-grid">
                        {interviews.map((item) => (
                            <div key={item.id} className="history-card" onClick={() => viewInterview(item)}>
                                <div className="card-header" style={{padding:20}}>
                                    <h3 className="card-title">{item.title || 'Phỏng vấn không tiêu chuẩn'}</h3>
                                    {getStatusBadge(item.status)}
                                </div>
                                <div className="card-body" style={{padding:20}}>
                                    <p className="date"><strong>Bắt đầu:</strong> {formatDate(item.started_at)}</p>
                                    <p className="date"><strong>Kết thúc:</strong> {formatDate(item.completed_at) || 'Chưa kết thúc'}</p>
                                </div>
                                <div className="card-footer" style={{padding:20}}>
                                    <span className="view-text">Xem chi tiết</span>
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

export default InterviewHistory;