// file: elios_FE/src/forum/components/CommentForm.js
import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaThumbsUp, FaThumbsDown, FaCommentAlt, FaTimes, FaFlag } from 'react-icons/fa';
import "../style/CommentForm.css";
import ReportPostModal from './ReportPostModal';

const CommentForm = ({ postStats, onSubmit, replyingTo, onCancelReply, onUpvote, onDownvote, onReport }) => {
    const [content, setContent] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const textareaRef = useRef(null);
    
    // Extract userVoteType from postStats (passed from PostDetail)
    const { userVoteType } = postStats;

    const handleCloseReportModal = () => setShowReportModal(false);
    const handleShowReportModal = () => setShowReportModal(true);

    // Automatically focus the textarea when a user clicks "reply"
    useEffect(() => {
        if (replyingTo && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [replyingTo]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content, replyingTo ? replyingTo.id : null);
            setContent(''); 
        }
    };

    const handleReportSubmit = (reason, details) => {
        onReport(reason, details);
        handleCloseReportModal(); 
    };

    return (
        <>
            <Form id="post-detail-comment-form" onSubmit={handleSubmit}>
                {replyingTo && (
                    <div id="replying-to-banner">
                        Đang trả lời : <strong>{replyingTo.author}</strong> {/* Translated */}
                        <Button
                            variant="link"
                            id="comment-form-cancel-reply-btn"
                            onClick={onCancelReply}
                            title="Hủy trả lời" // Translated
                        >
                            <FaTimes />
                        </Button>
                    </div>
                )}

                {/* These classNames are left as-is because they are repeating or have no CSS */}
                <div className="user-forum-post-stats">
                    <span
                        className={`upvote-stat-item up ${userVoteType === 'Upvote' ? 'active-vote' : ''}`}
                        onClick={onUpvote}
                        title="Thích" // Translated
                        style={{ 
                            cursor: 'pointer',
                            // Highlight color if upvoted (Bright Blue)
                            color: userVoteType === 'Upvote' ? '#087d24' : 'inherit'
                        }}
                    >
                        <FaThumbsUp /> {postStats.upvoteCount}
                    </span>
                    <span
                        className={`downvote-stat-item down ${userVoteType === 'Downvote' ? 'active-vote' : ''}`}
                        onClick={onDownvote}
                        title="Không thích" // Translated
                        style={{ 
                            cursor: 'pointer',
                            // Highlight color if downvoted (Bright Red)
                            color: userVoteType === 'Downvote' ? '#4e0303' : 'inherit' 
                        }}
                    >
                        <FaThumbsDown /> {postStats.downvoteCount}
                    </span>
                    <span className="stat-item comment">
                        <FaCommentAlt /> {postStats.commentCount}
                    </span>
                    <span 
                        className="stat-item report" 
                        onClick={handleShowReportModal} // Trigger modal
                        title="Báo cáo bài viết" // Translated
                        style={{ cursor: 'pointer' }} // Add pointer cursor
                    >
                        <FaFlag />
                    </span>
                </div>

                <Form.Group>
                    <Form.Control
                        ref={textareaRef}
                        as="textarea"
                        rows={3}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={replyingTo ? `Viết câu trả lời của bạn...` : "Viết bình luận..."} // Translated
                        required
                    />
                </Form.Group>
                <Button variant="primary" size="sm" className="mt-2" type="submit">
                    Đăng bình luận {/* Translated */}
                </Button>
            </Form>

            {/* Render the modal */}
            <ReportPostModal
                show={showReportModal}
                handleClose={handleCloseReportModal}
                handleSubmit={handleReportSubmit}
            />
        </>
    );
};

export default CommentForm;