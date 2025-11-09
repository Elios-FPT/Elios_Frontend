// file: elios_FE/src/forum/components/CommentForm.js
import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaThumbsUp, FaThumbsDown, FaCommentAlt, FaTimes, FaFlag } from 'react-icons/fa';
import "../style/CommentForm.css";
import ReportModal from './ReportModal'; // Import the new modal

const CommentForm = ({ postStats, onSubmit, replyingTo, onCancelReply, onUpvote, onDownvote, onReport }) => {
    const [content, setContent] = useState('');
    const [showReportModal, setShowReportModal] = useState(false); // State for modal
    const textareaRef = useRef(null);

    // Modal handlers
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
            // Pass the content and the ID of the comment being replied to
            onSubmit(content, replyingTo ? replyingTo.id : null);
            setContent(''); // Clear the form after submission
        }
    };

    const handleReportSubmit = (reason, details) => {
        // Call the onReport function passed from PostDetail
        onReport(reason, details);
        handleCloseReportModal(); // Close modal after submit
    };

    return (
        <>
            <Form id="post-detail-comment-form" onSubmit={handleSubmit}>
                {replyingTo && (
                    <div id="replying-to-banner">
                        Replying to : <strong>{replyingTo.author}</strong>
                        <Button
                            variant="link"
                            id="comment-form-cancel-reply-btn"
                            onClick={onCancelReply}
                            title="Cancel reply"
                        >
                            <FaTimes />
                        </Button>
                    </div>
                )}

                {/* These classNames are left as-is because they are repeating or have no CSS */}
                <div className="user-forum-post-stats">
                    <span
                        className="upvote-stat-item up"
                        onClick={onUpvote}
                        title="Upvote"
                    >
                        <FaThumbsUp /> {postStats.upvoteCount}
                    </span>
                    <span
                        className="downvote-stat-item down"
                        onClick={onDownvote}
                        title="Downvote"
                    >
                        <FaThumbsDown /> {postStats.downvoteCount}
                    </span>
                    <span className="stat-item comment">
                        <FaCommentAlt /> {postStats.commentCount}
                    </span>
                    <span 
                        className="stat-item report" 
                        onClick={handleShowReportModal} // Trigger modal
                        title="Report post"
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
                        placeholder={replyingTo ? `Write your reply...` : "Write a comment..."}
                        required
                    />
                </Form.Group>
                <Button variant="primary" size="sm" className="mt-2" type="submit">
                    Post Comment
                </Button>
            </Form>

            {/* Render the modal */}
            <ReportModal
                show={showReportModal}
                handleClose={handleCloseReportModal}
                handleSubmit={handleReportSubmit}
            />
        </>
    );
};

export default CommentForm;