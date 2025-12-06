// file: elios_FE/src/codingChallenge/components/SolutionVIewDetailModal.js
import React, { useState, useEffect, useContext } from "react";
import { Modal, Button, Dropdown, Form } from "react-bootstrap";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { FaEllipsisV, FaEdit, FaTrash, FaSave, FaTimes, FaFlag } from "react-icons/fa";
import { API_ENDPOINTS } from "../../api/apiConfig";
import { formatRelativeTime } from "../../forum/utils/formatTime";
import CommentForm from "../../forum/components/CommentForm";
import LoadingCircle1 from "../../components/loading/LoadingCircle1";
import { AppContext } from "../../context/AppContext";
import 'highlight.js/styles/github-dark.css';
import "../style/SolutionViewDetailModal.css";

const SolutionViewDetailModal = ({ solutionId, show, onClose }) => {
    const { user } = useContext(AppContext);
    const [solution, setSolution] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editContent, setEditContent] = useState("");

    useEffect(() => {
        if (show && solutionId) {
            fetchSolutionDetails(solutionId);
        }
    }, [show, solutionId]);

    const fetchSolutionDetails = async (id) => {
        setLoading(true);
        try {
            // Using the endpoint provided in the skeleton
            const response = await axios.get(API_ENDPOINTS.GET_POST_CONTENT(id), {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });
            if (response.data.status === 200) {
                const data = response.data.responseData;
                data.comments = data.comments || [];
                setSolution(data);
            } else {
                console.error("Failed to fetch solution details:", response.data);
            }
        } catch (error) {
            console.error("Error fetching solution details:", error);
        } finally {
            setLoading(false);
        }
    };

    // --- State Helpers (Mirrors PostDetail.js) ---
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

        setSolution(current => {
            if (!parentId) {
                return { ...current, comments: [...current.comments, newComment] };
            } else {
                return { ...current, comments: findAndAddReply(current.comments) };
            }
        });
    };

    const updateCommentInState = (commentId, newContent) => {
        const updateRecursive = (comments) => {
            return comments.map(comment => {
                if (comment.commentId === commentId) {
                    return { ...comment, content: newContent };
                }
                if (comment.replies) {
                    return { ...comment, replies: updateRecursive(comment.replies) };
                }
                return comment;
            });
        };
        setSolution(prev => ({ ...prev, comments: updateRecursive(prev.comments || []) }));
    };

    const deleteCommentFromState = (commentId) => {
        const deleteRecursive = (comments) => {
            return comments
                .filter(c => c.commentId !== commentId)
                .map(c => {
                    if (c.replies) {
                        return { ...c, replies: deleteRecursive(c.replies) };
                    }
                    return c;
                });
        };
        setSolution(prev => ({ ...prev, comments: deleteRecursive(prev.comments || []) }));
    };

    // --- Handlers ---
    const handleCommentSubmit = async (content, parentCommentId) => {
        if (!content.trim()) return;

        let currentUserName = user ? `${user.firstName} ${user.lastName}`.trim() : "You";
        let currentUserAvatar = user?.avatarUrl || "/default-avatar.png";

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
            const body = { postId: solutionId, parentCommentId: parentCommentId || null, content };
            const response = await axios.post(API_ENDPOINTS.CREATE_COMMENT, body, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });
            
            // Sync with server response if available
            if (response.data.responseData && response.data.responseData.comments) {
                setSolution(response.data.responseData);
            }
        } catch (error) {
            alert("Error submitting comment. Please try again.");
            console.error("Error submitting comment:", error);
        }
    };

    const handleUpvote = async () => {
        setSolution(prev => ({ ...prev, upvoteCount: prev.upvoteCount + 1 }));
        try {
            await axios.post(API_ENDPOINTS.UPVOTE_POST(solutionId), {}, { withCredentials: true });
        } catch (error) {
            setSolution(prev => ({ ...prev, upvoteCount: prev.upvoteCount - 1 }));
        }
    };

    const handleDownvote = async () => {
        setSolution(prev => ({ ...prev, downvoteCount: prev.downvoteCount + 1 }));
        try {
            await axios.post(API_ENDPOINTS.DOWNVOTE_POST(solutionId), {}, { withCredentials: true });
        } catch (error) {
            setSolution(prev => ({ ...prev, downvoteCount: prev.downvoteCount - 1 }));
        }
    };

    // Edit & Delete
    const handleStartEdit = (comment) => {
        setEditingCommentId(comment.commentId);
        setEditContent(comment.content);
    };

    const handleSaveEdit = async (commentId) => {
        if (!editContent.trim()) return;
        updateCommentInState(commentId, editContent);
        setEditingCommentId(null);
        try {
            await axios.put(API_ENDPOINTS.EDIT_COMMENT(commentId), { content: editContent }, { withCredentials: true });
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const handleDeleteClick = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        deleteCommentFromState(commentId);
        try {
            await axios.delete(API_ENDPOINTS.DELETE_COMMENT(commentId), { withCredentials: true });
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleReport = async (reason, details) => {
         // Implement report logic here if needed, similar to PostDetail
         console.log("Report submitted", reason, details);
    }

    // --- Render Comments ---
    const renderComments = (comments) => {
        return comments.map((comment) => {
            let isAuthor = user && (user.firstName + " " + user.lastName === comment.authorFullName);
            const isEditing = editingCommentId === comment.commentId;

            return (
                <div key={comment.commentId} className="solution-comment-thread">
                    <div className="d-flex align-items-start solution-comment mb-3">
                        <img src={comment.authorAvatarUrl || "/default-avatar.png"} alt="user" className="solution-comment-avatar me-3" />
                        <div className="solution-comment-body w-100">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong className="solution-comment-author">{comment.authorFullName}</strong>
                                    <small className="text-muted ms-2">{formatRelativeTime(comment.createdAt)}</small>
                                </div>
                                <Dropdown className="solution-comment-dropdown">
                                    <Dropdown.Toggle variant="link" className="text-muted p-0 no-caret">
                                        <FaEllipsisV />
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu align="end" variant="dark">
                                        {isAuthor ? (
                                            <>
                                                <Dropdown.Item onClick={() => handleStartEdit(comment)}><FaEdit className="me-2" /> Edit</Dropdown.Item>
                                                <Dropdown.Item onClick={() => handleDeleteClick(comment.commentId)} className="text-danger"><FaTrash className="me-2" /> Delete</Dropdown.Item>
                                            </>
                                        ) : (
                                            <Dropdown.Item><FaFlag className="me-2" /> Report</Dropdown.Item>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>

                            {isEditing ? (
                                <div className="mt-2">
                                    <Form.Control 
                                        as="textarea" rows={2} value={editContent} 
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="mb-2 bg-dark text-white border-secondary"
                                    />
                                    <div className="d-flex gap-2">
                                        <Button size="sm" variant="success" onClick={() => handleSaveEdit(comment.commentId)}><FaSave className="me-1" /> Save</Button>
                                        <Button size="sm" variant="secondary" onClick={() => setEditingCommentId(null)}><FaTimes className="me-1" /> Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <p className="mb-0 mt-1">{comment.content}</p>
                            )}

                            {!isEditing && (
                                <div className="mt-1">
                                    <Button variant="link" size="sm" className="p-0 text-decoration-none text-muted" onClick={() => setReplyingTo({ id: comment.commentId, author: comment.authorFullName })}>
                                        Reply
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                    {comment.replies && comment.replies.length > 0 && (
                        <div className="solution-comment-replies">{renderComments(comment.replies)}</div>
                    )}
                </div>
            );
        });
    };

    return (
        <Modal 
            show={show} 
            onHide={onClose} 
            size="lg" 
            centered
            contentClassName="solution-detail-modal-content" 
            id="solution-detail-modal"
        >
            <Modal.Header closeButton closeVariant="white">
                {loading || !solution ? (
                    <Modal.Title>Loading...</Modal.Title>
                ) : (
                    <div className="d-flex align-items-center gap-3">
                        <img src={solution.authorAvatarUrl || "/default-avatar.png"} alt="avatar" className="solution-modal-avatar" />
                        <div>
                            <h5 className="mb-0 text-white">{solution.authorFullName}</h5>
                            <small className="text-muted">{formatRelativeTime(solution.createdAt)}</small>
                        </div>
                    </div>
                )}
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center py-5"><LoadingCircle1 /></div>
                ) : solution ? (
                    <>
                        <h4 className="mb-3 text-success">{solution.title}</h4>
                        <div className="solution-modal-content mb-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                {solution.content}
                            </ReactMarkdown>
                        </div>
                        <hr className="border-secondary" />
                        <h5 className="text-white mb-3">Comments</h5>
                        <div className="solution-comments-list">
                            {renderComments(solution.comments || [])}
                        </div>
                        <div className="mt-4">
                            <CommentForm 
                                postStats={{
                                    upvoteCount: solution.upvoteCount || 0,
                                    downvoteCount: solution.downvoteCount || 0,
                                    commentCount: solution.comments?.length || 0
                                }}
                                onSubmit={handleCommentSubmit}
                                replyingTo={replyingTo}
                                onCancelReply={() => setReplyingTo(null)}
                                onUpvote={handleUpvote}
                                onDownvote={handleDownvote}
                                onReport={handleReport}
                            />
                        </div>
                    </>
                ) : (
                    <p className="text-center text-muted">Failed to load solution.</p>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default SolutionViewDetailModal;