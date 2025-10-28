// file: elios_FE/src/forum/pages/PostDetail.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button, Form } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "../style/PostDetail.css";
import 'highlight.js/styles/github-dark.css';
import { formatRelativeTime } from "../utils/formatTime";
import UserNavbar from "../../components/navbars/UserNavbar";
import { API_ENDPOINTS } from "../../api/apiConfig";
import { FaEye, FaCommentAlt, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import CommentForm from "../components/CommentForm";

const PostDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.GET_POST_CONTENT(id), {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const data = response.data.responseData;
                data.comments = data.comments || [];
                setPost(data);
            } catch (error) {
                console.error('Error fetching post:', error);
            }
        };

        fetchPost();
    }, [id]);

    const handleCommentSubmit = async (content, parentCommentId) => {
        if (!content.trim()) return;

        try {
            const body = {
                postId: id,
                parentCommentId: parentCommentId || null,
                content,
            };

            const response = await axios.post(API_ENDPOINTS.CREATE_COMMENT, body, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            const updated = response.data.responseData;
            updated.comments = updated.comments || [];
            setPost(updated);

            // Cancel the reply state after successfully posting
            setReplyingTo(null);
            console.log("✅ Comment created successfully");
        } catch (error) {
            console.error("❌ Error creating comment:", error);
        }
    };

    // --- NEW function to set the reply state ---
    const handleSetReply = (comment) => {
        setReplyingTo({
            id: comment.commentId,
            author: comment.authorFullName,
        });
    };

    // --- NEW function to cancel the reply ---
    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    // Helper function to render comments and their replies recursively
    const renderComments = (comments) => {
        return comments.map((comment) => (
            <div key={comment.commentId} className="comment-thread">
                <div className="d-flex align-items-start comment mb-3">
                    <img
                        src={comment.authorAvatarUrl || "/default-avatar.png"}
                        alt="user"
                        className="comment-avatar me-3"
                    />
                    <div className="comment-body">
                        <strong className="comment-author">{comment.authorFullName}</strong>{" "}
                        <small className="text-muted">{formatRelativeTime(comment.createdAt)}</small>
                        <p className="mb-0">{comment.content}</p>
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 mt-1 reply-button"
                            onClick={() => handleSetReply(comment)}
                        >
                            Reply
                        </Button>
                    </div>
                </div>

                {/* Render replies recursively */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-replies">
                        {renderComments(comment.replies)}
                    </div>
                )}
            </div>
        ));
    };



    if (!post) {
        return (
            <div className="text-center mt-5 text-white">
                <p>Post not found.</p>
                <Button onClick={() => navigate("/forum")} variant="outline-light">
                    Back to Forum
                </Button>
            </div>
        );
    }

    return (
        <>
            <UserNavbar />

            <div id="post-detail-background">

                <Container id="post-detail-container">
                    <div id="post-detail-back-button">
                        <Button variant="outline-light" onClick={() => navigate("/forum")}>
                            ← Back to Forum
                        </Button>
                    </div>
                    <Card.Header id="post-detail-card-header">
                        <img
                            src={post.authorAvatarUrl}
                            alt="user"
                            className="post-avatar"
                        />
                        <div>
                            <h5 className="mb-0 post-author">{post.authorFullName}</h5>
                            <small className="post-time">{formatRelativeTime(post.createdAt)}</small>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <h3 className="post-title">{post.title}</h3>

                        <div className="markdown-content mb-4">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeHighlight]}
                            >
                                {post.content}
                            </ReactMarkdown>
                        </div>
                        {post.url && post.url.length > 0 && (
                            <div className="text-center my-3">
                                {post.url.map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt="post media"
                                        className="img-fluid rounded mb-2"
                                    />
                                ))}
                            </div>
                        )}
                        <hr />
                        <h5 className="comments-section-title">Comments</h5>

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
                        />
                    </Card.Body>
                </Container>
            </div>
        </>
    );
};

export default PostDetail;