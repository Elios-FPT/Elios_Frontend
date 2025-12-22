import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../style/InterviewHistory.css';
import UserNavbar from '../../components/navbars/UserNavbar';

function InterviewHistory() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [showFeedback, setShowFeedback] = useState(false);

    const userId = localStorage.getItem('userId');
    const [isSharing, setIsSharing] = useState(false);

    // ... (logic remains the same) ...
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
            }
        } catch (err) {
            // handle error
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
                console.log('Error loading history');
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [userId]);

    const viewInterview = async (interview) => {
        try {
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
        } catch (err) {
            console.log('Error viewing interview');
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
            COMPLETE: { bg: '#10b981', text: 'Hoàn thành' },
            EVALUATING: { bg: '#8b5cf6', text: 'Đang chấm điểm' },
            QUESTIONING: { bg: '#3b82f6', text: 'Đang phỏng vấn' },
            FOLLOW_UP: { bg: '#f59e0b', text: 'Follow-up' },
            IDLE: { bg: '#6c757d', text: 'Chưa bắt đầu' },
        };
        const s = map[status] || { bg: '#6b7280', text: status };
        // Note: Inline style for badge BG is okay as it's logic-dependent
        return <span className="InterviewHistory-status-badge" style={{ background: s.bg }}>{s.text}</span>;
    };

    // ==================== CHI TIẾT BUỔI ====================
    if (selected) {
        return (
            <div>
                <header>
                    <UserNavbar />
                </header>

                <div id="InterviewHistory-detail-page">
                    <div style={{ marginTop: 20 }}></div>
                    <div id="InterviewHistory-detail-container">
                        {/* Header */}
                        <div id="InterviewHistory-detail-header-card">
                            <button onClick={() => setSelected(null)} id="InterviewHistory-back-button">
                                <span className="material-icons">arrow_back</span>
                                Quay lại danh sách
                            </button>
                            <h1 id="InterviewHistory-detail-title">{selected.title || 'Buổi phỏng vấn'}</h1>
                            <p id="InterviewHistory-detail-date-label">
                                {formatDate(selected.started_at)} → {formatDate(selected.completed_at) || 'Chưa kết thúc'}
                            </p>
                        </div>

                        {/* Transcript */}
                        <div id="InterviewHistory-transcript-container">
                            <h2 id="InterviewHistory-transcript-header">Nội dung buổi phỏng vấn</h2>
                            <div className="InterviewHistory-messages-list">
                                {messages.length === 0 ? (
                                    <p className="InterviewHistory-empty-text">Không có tin nhắn</p>
                                ) : (
                                    messages.map((msg, i) => {
                                        const isQuestion = msg.type === 'question' || msg.type === 'followup';
                                        const isAnswer = msg.type === 'answer';

                                        return (
                                            <div
                                                key={i}
                                                className={`InterviewHistory-message-row ${isQuestion ? 'ai' : 'user'}`}
                                                style={{
                                                    alignSelf: isQuestion ? 'flex-start' : 'flex-end',
                                                    maxWidth: '80%'
                                                }}
                                            >
                                                <div
                                                    className="InterviewHistory-message-bubble"
                                                    style={{
                                                        // === THEME UPDATE: Dark Bubble Colors ===
                                                        background: isQuestion
                                                            ? '#2c313a' // Dark Gray for AI
                                                            : '#0f8a57',   // Elios Green for User
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
                                                            color: '#19c37d', // Green accent title for AI
                                                            marginBottom: '8px',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.5px'
                                                        }}>
                                                            {msg.type === 'followup' ? 'Follow-up' : 'Câu hỏi'}
                                                        </div>
                                                    )}

                                                    <div className="InterviewHistory-message-content">
                                                        {msg.text || '(Không có nội dung văn bản)'}
                                                    </div>

                                                    {/* Audio Controls */}
                                                    {isQuestion && msg.metadata?.audioData && (
                                                        <audio controls className="InterviewHistory-audio-player" style={{ marginTop: 12 }}>
                                                            <source src={`data:audio/wav;base64,${msg.metadata.audioData}`} type="audio/wav" />
                                                        </audio>
                                                    )}

                                                    {isAnswer && msg.is_voice && msg.audio_path && (
                                                        <audio controls className="InterviewHistory-audio-player" style={{ marginTop: 12, width: 240 }}>
                                                            <source src={msg.audio_path} />
                                                        </audio>
                                                    )}

                                                    <div className="InterviewHistory-timestamp">
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
                            <div id="InterviewHistory-feedback-trigger-container">
                                <button onClick={() => setShowFeedback(true)} id="InterviewHistory-feedback-button">
                                    Xem đánh giá chi tiết ({feedback.overall_score?.toFixed(1) || 'N/A'}/100)
                                </button>
                            </div>
                        )}

                        {selected?.status === 'COMPLETE' && (
                            <div id="InterviewHistory-share-container">
                                <button
                                    onClick={handleQuickShare}
                                    disabled={isSharing}
                                    id="InterviewHistory-share-button"
                                >
                                    <span className="material-icons">share</span>
                                    {isSharing ? 'Đang chia sẻ...' : 'Chia sẻ để nhận review từ cộng đồng'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Feedback Modal */}
                    {showFeedback && feedback && (
                        <div id="InterviewHistory-modal-overlay" onClick={() => setShowFeedback(false)}>
                            <div id="InterviewHistory-modal-card" onClick={e => e.stopPropagation()}>
                                <button id="InterviewHistory-modal-close-btn" onClick={() => setShowFeedback(false)}>×</button>
                                <h2 id="InterviewHistory-modal-title">Đánh giá buổi phỏng vấn</h2>
                                <div id="InterviewHistory-modal-score-display">
                                    {feedback.overall_score?.toFixed(1) || 'N/A'}<small>/100</small>
                                </div>

                                <div id="InterviewHistory-modal-score-grid">
                                    {feedback.theoretical_score_avg !== undefined && (
                                        <div className="InterviewHistory-score-box">
                                            <span className="InterviewHistory-score-label">Kiến thức chuyên môn</span>
                                            <span className="InterviewHistory-score-value">{feedback.theoretical_score_avg.toFixed(1)}</span>
                                        </div>
                                    )}
                                    {feedback.speaking_score_avg !== undefined && (
                                        <div className="InterviewHistory-score-box">
                                            <span className="InterviewHistory-score-label">Giao tiếp</span>
                                            <span className="InterviewHistory-score-value">{feedback.speaking_score_avg.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>

                                {/* ... Feedback Lists ... */}
                                {feedback.strengths?.length > 0 && (
                                    <div className="InterviewHistory-modal-section">
                                        <h3>Điểm mạnh</h3>
                                        <ul>{feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                    </div>
                                )}

                                {feedback.weaknesses?.length > 0 && (
                                    <div className="InterviewHistory-modal-section">
                                        <h3>Cần cải thiện</h3>
                                        <ul>{feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
                                    </div>
                                )}

                                {feedback.study_recommendations?.length > 0 && (
                                    <div className="InterviewHistory-modal-section">
                                        <h3>Gợi ý học tập</h3>
                                        <ul>{feedback.study_recommendations.map((r, i) => <li key={i}>{r}</li>)}</ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>);
    }

    // ==================== DANH SÁCH LỊCH SỬ ====================
    return (
        <div id="InterviewHistory-page">
            <header>
                <UserNavbar />
            </header>
            <div id="InterviewHistory-header">
                <h1 id="InterviewHistory-page-title">Lịch sử phỏng vấn</h1>
                <p id="InterviewHistory-page-subtitle">Xem lại các buổi phỏng vấn bạn đã thực hiện</p>
            </div>

            <div id="InterviewHistory-container">
                {loading ? (
                    <div id="InterviewHistory-loading-state">
                        <span id="InterviewHistory-loading-icon" className="material-icons">hourglass_empty</span>
                        <p>Đang tải lịch sử...</p>
                    </div>
                ) : interviews.length === 0 ? (
                    <div id="InterviewHistory-empty-state">
                        <span id="InterviewHistory-empty-icon" className="material-icons">history</span>
                        <h3>Chưa có buổi phỏng vấn nào</h3>
                        <p>Hãy bắt đầu một buổi phỏng vấn mới để lưu vào lịch sử!</p>
                    </div>
                ) : (
                    <div id="InterviewHistory-grid">
                        {interviews.map((item) => (
                            <div key={item.id} className="InterviewHistory-card-item" onClick={() => viewInterview(item)}>
                                <div className="InterviewHistory-card-header">
                                    <h3 className="InterviewHistory-card-title">{item.title || 'Phỏng vấn không tiêu chuẩn'}</h3>
                                    {getStatusBadge(item.status)}
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
    );
}

export default InterviewHistory;