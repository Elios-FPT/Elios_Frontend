// file: elios_FE/src/codingChallenge/components/SolutionCommentForm.js
import React, { useState, useEffect, useRef } from 'react';
import { Form, Button } from 'react-bootstrap';
import { FaThumbsUp, FaThumbsDown, FaCommentAlt, FaTimes, FaFlag } from 'react-icons/fa';
import "../style/SolutionCommentForm.css";
import ReportPostModal from '../../forum/components/ReportPostModal';

const SolutionCommentForm = ({ postStats, onSubmit, replyingTo, onCancelReply, onUpvote, onDownvote, onReport }) => {
    const [content, setContent] = useState('');
    const [showReportModal, setShowReportModal] = useState(false);
    const textareaRef = useRef(null);

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
        // onReport here triggers the parent handler for reporting the "Post" (Solution)
        onReport(reason, details);
        handleCloseReportModal(); 
    };

    return (
        <>
            <Form id="solution-comment-form" onSubmit={handleSubmit}>
                {replyingTo && (
                    <div id="solution-replying-to-banner">
                        Replying to : <strong>{replyingTo.author}</strong>
                        <Button
                            variant="link"
                            id="solution-comment-cancel-reply-btn"
                            onClick={onCancelReply}
                            title="Cancel reply"
                        >
                            <FaTimes />
                        </Button>
                    </div>
                )}

                <div className="solution-post-stats">
                    {/* <span
                        className="stat-item upvote"
                        onClick={onUpvote}
                        title="Upvote Solution"
                    >
                        <FaThumbsUp /> {postStats.upvoteCount}
                    </span>
                    <span
                        className="stat-item downvote"
                        onClick={onDownvote}
                        title="Downvote Solution"
                    >
                        <FaThumbsDown /> {postStats.downvoteCount}
                    </span> */}

                    {/* Comment Count */}
                    <span className="stat-item comment">
                        <FaCommentAlt /> {postStats.commentCount}
                    </span>

                    {/* Report Button */}
                    <span 
                        className="stat-item report" 
                        onClick={handleShowReportModal} 
                        title="Report Solution"
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
                        className="solution-comment-input"
                    />
                </Form.Group>
                <Button variant="success" size="sm" className="mt-2" type="submit">
                    Post Comment
                </Button>
            </Form>

            {/* Modal for Reporting the Solution */}
            <ReportPostModal
                show={showReportModal}
                handleClose={handleCloseReportModal}
                handleSubmit={handleReportSubmit}
            />
        </>
    );
};

export default SolutionCommentForm;