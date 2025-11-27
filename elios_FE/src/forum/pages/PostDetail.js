// file: elios_FE/src/forum/pages/PostDetail.js
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
import {  FaFlag } from 'react-icons/fa';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "../style/PostDetail.css";
import 'highlight.js/styles/github-dark.css';
import { formatRelativeTime } from "../utils/formatTime";
import UserNavbar from "../../components/navbars/UserNavbar";
import { API_ENDPOINTS } from "../../api/apiConfig";
import CommentForm from "../components/CommentForm";
import LoadingCircle1 from "../../components/loading/LoadingCircle1";
import ReportPostModal from "../components/ReportPostModal"; // Import the modal here for comment reporting

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AppContext);
    const [post, setPost] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCommentReportModal, setShowCommentReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState({ id: null, type: null });

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                const response = await axios.get(API_ENDPOINTS.GET_POST_CONTENT(id), {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });
                const data = response.data.responseData;
                data.comments = data.comments || [];
                setPost(data);
            } catch (error) {
                console.error('Error fetching post:', error);
                setPost(null);
            } finally {
                setLoading(false);
            }
        };
        fetchPost();
    }, [id]);

    const addCommentToState = (newComment, parentId) => {
        const findAndAddReply = (comments) => {
            return comments.map(comment => {
                if (comment.commentId === parentId) {
                    return { ...comment, replies: [...(comment.replies || []), newComment] };
                }
                if (comment.replies && comment.replies.length > 0) {
                    return { ...comment, replies: findAndAddReply(comment.replies) };
                }
                return comment;
            });
        };

        setPost(currentPost => {
            if (!parentId) {
                return { ...currentPost, comments: [...currentPost.comments, newComment] };
            } else {
                const updatedComments = findAndAddReply(currentPost.comments);
                return { ...currentPost, comments: updatedComments };
            }
        });
    };

    const handleCommentSubmit = async (content, parentCommentId) => {
        if (!content.trim()) return;

        let currentUserName = "You";
        let currentUserAvatar = "/default-avatar.png";

        try {
            if (user) {
                currentUserName = `${user.firstName} ${user.lastName}`.trim() || "You";
                currentUserAvatar = user.avatarUrl || "/default-avatar.png";
            }
        } catch (e) {
            console.error("Could not parse user data from localStorage for optimistic comment.", e);
        }

        const tempId = `temp-${Date.now()}`;
        const tempComment = {
            commentId: tempId,
            content: content,
            createdAt: new Date().toISOString(),
            authorFullName: currentUserName,
            authorAvatarUrl: currentUserAvatar,
            replies: [],
        };

        addCommentToState(tempComment, parentCommentId);
        setReplyingTo(null);

        try {
            const body = { postId: id, parentCommentId: parentCommentId || null, content };
            const response = await axios.post(API_ENDPOINTS.CREATE_COMMENT, body, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            const updatedPostFromServer = response.data.responseData;
            updatedPostFromServer.comments = updatedPostFromServer.comments || [];
            setPost(updatedPostFromServer);

        } catch (error) {
            console.error("Error posting comment:", error);
        }
    };

    const handleUpvote = async () => {
        const originalPost = { ...post };
        setPost((current) => ({
            ...current,
            upvoteCount: current.upvoteCount + 1,
        }));

        try {
            const response = await axios.post(
                API_ENDPOINTS.UPVOTE_POST(id),
                {},
                { withCredentials: true }
            );
            const updatedData = response.data.responseData;
            setPost((current) => ({
                ...current,
                ...updatedData,
            }));

        } catch (error) {
            console.error("Error upvoting post:", error);
            setPost(originalPost); 
        }
    };

    const handleDownvote = async () => {
        const originalPost = { ...post };
        setPost((current) => ({
            ...current,
            downvoteCount: current.downvoteCount + 1,
        }));

        try {
            const response = await axios.post(
                API_ENDPOINTS.DOWNVOTE_POST(id),
                {},
                { withCredentials: true }
            );

            const updatedData = response.data.responseData;
            setPost((current) => ({
                ...current,
                ...updatedData,
            }));

        } catch (error) {
            console.error("Error downvoting post:", error);
            setPost(originalPost);
        }
    };

    const handleReport = async (targetType, targetId, reason, details) => {
        if (!reason) {
            console.error("Report reason is required.");
            return;
        }

        try {
            const endpoint = targetType === "Post" ? API_ENDPOINTS.REPORT_POST : API_ENDPOINTS.REPORT_COMMENT;
            await axios.post(
                endpoint,
                {
                    targetType: targetType,
                    targetId: targetId,
                    reason: reason,
                    details: details ? details.trim() : ""
                },
                {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" }
                }
            );
            alert(`${targetType} reported successfully!`);
        } catch (error) {
            console.error(`Error reporting ${targetType}:`, error);
            alert(`There was an error submitting your ${targetType} report. Please try again.`);
        }
    };

    const handleEditComment = async (commentId, newContent) => {
        try {
            const response = await axios.put(
                API_ENDPOINTS.UPDATE_COMMENT(commentId),
                { content: newContent },
                { withCredentials: true }
            );
            const updatedPostFromServer = response.data.responseData;
            updatedPostFromServer.comments = updatedPostFromServer.comments || [];
            setPost(updatedPostFromServer);
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const handleReportPost = async (reason, details) => {
        handleReport("Post", id, reason, details);
    };

    const handleReportComment = async (commentId, reason, details) => {
        handleReport("Comment", commentId, reason, details);
        setShowCommentReportModal(false); 
    }

    const handleShowCommentReportModal = (commentId) => {
        setReportTarget({ id: commentId, type: "Comment" });
        setShowCommentReportModal(true);
    };

    const handleCloseCommentReportModal = () => {
        setShowCommentReportModal(false);
        setReportTarget({ id: null, type: null });
    };

    const handleSetReply = (comment) => {
        setReplyingTo({ id: comment.commentId, author: comment.authorFullName });
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const renderComments = (comments) => {
        return comments.map((comment) => (
            <div key={comment.commentId} className="comment-thread">
                <div className="d-flex align-items-start comment mb-3">
                    <img src={comment.authorAvatarUrl || "/default-avatar.png"} alt="user" className="comment-avatar me-3" />
                    <div className="comment-body">
                        <strong className="comment-author">{comment.authorFullName}</strong>{" "}
                        <small className="text-muted">{formatRelativeTime(comment.createdAt)}</small>
                        <p className="mb-0">{comment.content}</p>
                        <div className="comment-actions">
                            <Button variant="link" size="sm" className="p-0 mt-1 reply-button" onClick={() => handleSetReply(comment)}>
                                Reply
                            </Button>
                            <span className="mx-2 text-muted">|</span>
                            {/* Button to open the report modal for the comment */}
                            <Button 
                                variant="link" 
                                size="sm" 
                                className="p-0 mt-1 report-comment-button" 
                                onClick={() => handleShowCommentReportModal(comment.commentId)}
                            >
                                <FaFlag />
                            </Button>
                        </div>
                    </div>
                </div>
                {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-replies">{renderComments(comment.replies)}</div>
                )}
            </div>
        ));
    };

    if (loading) {
        return (
            <>
                <UserNavbar />
                <div id="post-detail-background" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <LoadingCircle1 />
                </div>
            </>
        );
    }

    if (!post) {
        return (
            <>
                <UserNavbar />
                <div id="post-detail-background" className="text-center pt-5 text-white">
                    <p>Post not found or could not be loaded.</p>
                    <Button onClick={() => navigate("/forum")} variant="outline-light">Back to Forum</Button>
                </div>
            </>
        );
    }

    return (
        <>
            <UserNavbar />
            <div id="post-detail-background">
                <Container id="post-detail-container">
                    <div id="post-detail-back-button">
                        <Button variant="outline-light" onClick={() => navigate("/forum")}>← Back to Forum</Button>
                    </div>
                    <Card.Header id="post-detail-card-header">
                        <img src={post.authorAvatarUrl} alt="user" id="post-detail-avatar" />
                        <div>
                            <h5 className="mb-0" id="post-detail-author">{post.authorFullName}</h5>
                            <small id="post-detail-time">{formatRelativeTime(post.createdAt)}</small>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <h3 id="post-detail-title">{post.title}</h3>
                        <div className="mb-4" id="post-detail-markdown-content">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                {post.content}
                            </ReactMarkdown>
                        </div>
                        {/* Image rendering block removed as requested */}
                        <hr />
                        <h5 id="post-detail-comments-title">Comments</h5>
                        {renderComments(post.comments || [])}
                        <CommentForm
                            postStats={{
                                upvoteCount: post.upvoteCount,
                                downvoteCount: post.downvoteCount,
                                commentCount: post.commentCount,
                            }}
                            onSubmit={handleCommentSubmit}
                            replyingTo={replyingTo}
                            onCancelReply={handleCancelReply}
                            onUpvote={handleUpvote}
                            onDownvote={handleDownvote}
                            onReport={handleReportPost} 
                        />
                    </Card.Body>
                </Container>
            </div>
            
            {/* Modal for Comment Reporting */}
            <ReportPostModal
                show={showCommentReportModal}
                handleClose={handleCloseCommentReportModal}
                // Pass the comment ID to the submit handler
                handleSubmit={(reason, details) => handleReportComment(reportTarget.id, reason, details)}
            />
        </>
    );
};

export default PostDetail;