// file: elios_FE/src/forum/pages/PostDetail.js
import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Dropdown, Form } from "react-bootstrap";
import { FaFlag, FaEllipsisV, FaEdit, FaTrash, FaSave, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
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
import ReportPostModal from "../components/ReportPostModal";

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AppContext);
    const [post, setPost] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Reporting State
    const [showCommentReportModal, setShowCommentReportModal] = useState(false);
    const [reportTarget, setReportTarget] = useState({ id: null, type: null });

    // Editing State
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");

    // Error Notification State
    const [actionError, setActionError] = useState(null);

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

    // --- State Management Helpers ---

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

    const updateCommentInState = (commentId, newContent) => {
        const updateRecursive = (comments) => {
            return comments.map(comment => {
                if (comment.commentId === commentId) {
                    return { ...comment, content: newContent };
                }
                if (comment.replies && comment.replies.length > 0) {
                    return { ...comment, replies: updateRecursive(comment.replies) };
                }
                return comment;
            });
        };
        setPost(prev => ({ ...prev, comments: updateRecursive(prev.comments || []) }));
    };

    const deleteCommentFromState = (commentId) => {
        const deleteRecursive = (comments) => {
            return comments
                .filter(c => c.commentId !== commentId)
                .map(c => {
                    if (c.replies && c.replies.length > 0) {
                        return { ...c, replies: deleteRecursive(c.replies) };
                    }
                    return c;
                });
        };
        setPost(prev => ({ ...prev, comments: deleteRecursive(prev.comments || []) }));
    };

    // --- Helper to handle API errors (specifically 403 Bans) ---
    const handleActionError = (error) => {
        if (error.response && error.response.status === 403) {
            // Use the message from the backend which contains ban reason and time
            setActionError(error.response.data.message || "Hành động bị cấm."); // Translated fallback
            
            // Scroll to top to ensure user sees the message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            console.error("Action failed:", error);
            // Optionally set a generic error, or just log it
        }
    };

    // --- Handlers ---

    const handleCommentSubmit = async (content, parentCommentId) => {
        setActionError(null); // Clear previous errors
        if (!content.trim()) return;

        let currentUserName = "Bạn"; // Translated
        let currentUserAvatar = "/default-avatar.png";

        try {
            if (user) {
                currentUserName = `${user.firstName} ${user.lastName}`.trim() || "Bạn"; // Translated
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

        // Optimistically add comment
        addCommentToState(tempComment, parentCommentId);
        setReplyingTo(null);

        try {
            const body = { postId: id, parentCommentId: parentCommentId || null, content };
            const response = await axios.post(API_ENDPOINTS.CREATE_COMMENT, body, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            // If server returns the updated post, use it.
            const updatedPostFromServer = response.data.responseData;
            if (updatedPostFromServer && typeof updatedPostFromServer === 'object') {
                 updatedPostFromServer.comments = updatedPostFromServer.comments || [];
                 setPost(updatedPostFromServer);
            }

        } catch (error) {
            // Revert optimistic update by removing the temp comment
            deleteCommentFromState(tempId);
            handleActionError(error);
        }
    };

    const handleUpvote = async () => {
        setActionError(null);
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
            setPost(originalPost); // Revert UI
            handleActionError(error);
        }
    };

    const handleDownvote = async () => {
        setActionError(null);
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
            setPost(originalPost); // Revert UI
            handleActionError(error);
        }
    };

    // --- Report Handlers ---
    const handleReport = async (targetType, targetId, reason, details) => {
        setActionError(null);
        if (!reason) {
            console.error("Report reason is required.");
            return;
        }
        try {
            const endpoint = targetType === "Post" ? API_ENDPOINTS.REPORT_POST : API_ENDPOINTS.REPORT_COMMENT;
            await axios.post(
                endpoint,
                { targetType, targetId, reason, details: details ? details.trim() : "" },
                { withCredentials: true, headers: { "Content-Type": "application/json" } }
            );
            // Translated success message logic
            const targetName = targetType === "Post" ? "Bài viết" : "Bình luận";
            alert(`${targetName} đã được báo cáo thành công!`); 
        } catch (error) {
            handleActionError(error);
        }
    };

    const handleReportPost = async (reason, details) => handleReport("Post", id, reason, details);
    
    const handleReportComment = async (commentId, reason, details) => {
        handleReport("Comment", commentId, reason, details);
        setShowCommentReportModal(false); 
    };

    const handleShowCommentReportModal = (commentId) => {
        setReportTarget({ id: commentId, type: "Comment" });
        setShowCommentReportModal(true);
    };

    const handleCloseCommentReportModal = () => {
        setShowCommentReportModal(false);
        setReportTarget({ id: null, type: null });
    };

    // --- Edit Handlers ---
    const handleStartEdit = (comment) => {
        setEditingCommentId(comment.commentId);
        setEditContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent("");
    };

    const handleSaveEdit = async (commentId) => {
        setActionError(null);
        if (!editContent.trim()) return;

        // 1. Update UI immediately (Optimistic update)
        const oldContent = post.comments.find(c => c.commentId === commentId)?.content; // simplified lookup
        updateCommentInState(commentId, editContent);
        
        // 2. Escape Edit Mode
        setEditingCommentId(null);

        try {
            await axios.put(
                API_ENDPOINTS.EDIT_COMMENT(commentId),
                { content: editContent },
                { withCredentials: true }
            );
        } catch (error) {
            // Revert if failed (requires more complex state tracking or refetch, simple log here)
            handleActionError(error);
        }
    };

    // --- Delete Handler ---
    const handleDeleteClick = async (commentId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) return; // Translated
        setActionError(null);

        // 1. Update UI immediately
        deleteCommentFromState(commentId);

        try {
            await axios.delete(
                API_ENDPOINTS.DELETE_COMMENT(commentId),
                { withCredentials: true }
            );    
        } catch (error) {
            handleActionError(error);
        }
    };

    // --- Reply Handlers ---
    const handleSetReply = (comment) => {
        setReplyingTo({ id: comment.commentId, author: comment.authorFullName });
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    // --- RENDER COMMENTS ---
    const renderComments = (comments) => {
        return comments.map((comment) => {
            // Determine if current user is the author
            let isAuthor = false;
            if (user) {
                isAuthor = (user.firstName + " " + user.lastName === comment.authorFullName);
            }
            
            const isEditing = editingCommentId === comment.commentId;

            return (
                <div key={comment.commentId} className="comment-thread">
                    <div className="d-flex align-items-start comment mb-3">
                        <img src={comment.authorAvatarUrl || "/default-avatar.png"} alt="user" className="comment-avatar me-3" />
                        
                        <div className="comment-body w-100">
                            {/* Header: Name, Time, Three-Dots Menu */}
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong className="comment-author">{comment.authorFullName}</strong>{" "}
                                    <small className="text-muted ms-2">{formatRelativeTime(comment.createdAt)}</small>
                                </div>

                                {/* Three Dots Dropdown */}
                                <Dropdown className="comment-dropdown">
                                    <Dropdown.Toggle variant="link" id={`dropdown-${comment.commentId}`} className="text-muted p-0 no-caret">
                                        <FaEllipsisV />
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu align="end" variant="dark" id={`dropdown-menu-${comment.commentId}`}>
                                        {isAuthor ? (
                                            <>
                                                <Dropdown.Item onClick={() => handleStartEdit(comment)}>
                                                    <FaEdit className="me-2" /> Chỉnh sửa {/* Translated */}
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleDeleteClick(comment.commentId)} className="text-danger">
                                                    <FaTrash className="me-2" /> Xóa {/* Translated */}
                                                </Dropdown.Item>
                                            </>
                                        ) : (
                                            <Dropdown.Item onClick={() => handleShowCommentReportModal(comment.commentId)}>
                                                <FaFlag className="me-2" /> Báo cáo {/* Translated */}
                                            </Dropdown.Item>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>

                            {/* Content or Edit Form */}
                            {isEditing ? (
                                <div className="mt-2" id={`edit-box-${comment.commentId}`}>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={2} 
                                        value={editContent} 
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="mb-2 bg-dark text-white border-secondary"
                                    />
                                    <div className="d-flex gap-2">
                                        <Button size="sm" variant="success" onClick={() => handleSaveEdit(comment.commentId)}>
                                            <FaSave className="me-1" /> Lưu {/* Translated */}
                                        </Button>
                                        <Button size="sm" variant="secondary" onClick={handleCancelEdit}>
                                            <FaTimes className="me-1" /> Hủy {/* Translated */}
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="mb-0 mt-1">{comment.content}</p>
                            )}

                            {/* Actions Footer (Reply) - Hide if editing */}
                            {!isEditing && (
                                <div className="comment-actions mt-1">
                                    <Button variant="link" size="sm" className="p-0 reply-button" onClick={() => handleSetReply(comment)}>
                                        Phản hồi {/* Translated */}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="comment-replies">{renderComments(comment.replies)}</div>
                    )}
                </div>
            );
        });
    };

    if (loading) return <><UserNavbar /><div id="post-detail-background" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}><LoadingCircle1 /></div></>;
    if (!post) return <><UserNavbar /><div id="post-detail-background" className="text-center pt-5 text-white"><p>Không tìm thấy bài viết.</p><Button onClick={() => navigate("/forum")} variant="outline-light">Quay lại diễn đàn</Button></div></>; // Translated

    return (
        <>
            <UserNavbar />
            <div id="post-detail-background">
                <Container id="post-detail-container">
                    
                    {/* --- Notification Banner for Action Errors (Bans) --- */}
                    {actionError && (
                        <div id="post-action-error-notification">
                            <FaExclamationTriangle className="me-2" />
                            <span>{actionError}</span>
                            <button onClick={() => setActionError(null)} id="post-action-error-close" title="Đóng">
                                <FaTimes />
                            </button>
                        </div>
                    )}

                    <div id="post-detail-back-button">
                        <Button variant="outline-light" onClick={() => navigate("/forum")}>← Quay lại diễn đàn</Button> {/* Translated */}
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
                        <hr />
                        <h5 id="post-detail-comments-title">Bình luận</h5> {/* Translated */}
                        {renderComments(post.comments || [])}
                        <CommentForm
                            postStats={{
                                upvoteCount: post.upvoteCount || 0,
                                downvoteCount: post.downvoteCount || 0,
                                commentCount: post.commentCount || 0,
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
            
            <ReportPostModal
                show={showCommentReportModal}
                handleClose={handleCloseCommentReportModal}
                handleSubmit={(reason, details) => handleReportComment(reportTarget.id, reason, details)}
            />
        </>
    );
};

export default PostDetail;