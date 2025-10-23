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

const PostDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);

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
                        {Array.isArray(post.comments) && post.comments.map((c) => (
                            <div key={c.commentId} className="d-flex align-items-start comment mb-3">
                                <img
                                    src={c.authorAvatarUrl || "/default-avatar.png"}
                                    alt="user"
                                    className="comment-avatar me-3"
                                />
                                <div className="comment-body">
                                    <strong className="comment-author">
                                        {c.authorFullName || "Anonymous"}
                                    </strong>{" "}
                                    <small className="text-muted">
                                        {formatRelativeTime(c.createdAt)}
                                    </small>
                                    <p className="mb-0">{c.content}</p>

                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="p-0 mt-1 reply-button"
                                        onClick={() => console.log("Reply to:", c.commentId)}
                                    >
                                        Reply
                                    </Button>


                                    {/* Replies check (nested comments) */}
                                    {c.replies && c.replies.length > 0 && (
                                        <div className="comment-replies">
                                            {c.replies.map((r) => (
                                                <div key={r.commentId} className="reply d-flex align-items-start mt-2">
                                                    <img
                                                        src={r.authorAvatarUrl || "/default-avatar.png"}
                                                        alt="reply-avatar"
                                                        className="reply-avatar me-2"
                                                    />
                                                    <div>
                                                        <strong>{r.authorFullName || "Anonymous"}</strong>{" "}
                                                        <small className="text-muted">
                                                            {formatRelativeTime(r.createdAt)}
                                                        </small>
                                                        <p className="mb-0">{r.content}</p>

                                                        <Button
                                                            variant="link"
                                                            size="sm"
                                                            className="p-0 mt-1 reply-button"
                                                            onClick={() => console.log("Reply to reply:", r.commentId)}
                                                        >
                                                            Reply
                                                        </Button>

                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        <Form className="post-detail-comment-form">
                            <div className="user-forum-post-stats">
                                <span className="stat-item up">
                                    <FaThumbsUp /> {post.upvoteCount}
                                </span>

                                <span className="stat-item down">
                                    <FaThumbsDown /> {post.downvoteCount}
                                </span>

                                <span className="stat-item comment">
                                    <FaCommentAlt /> {post.commentCount}
                                </span>
                            </div>
                            <Form.Group>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    placeholder="Write a comment..."
                                />
                            </Form.Group>
                            <Button variant="primary" size="sm" className="mt-2">
                                Post Comment
                            </Button>
                        </Form>
                    </Card.Body>
                </Container>
            </div>
        </>
    );
};

export default PostDetail;