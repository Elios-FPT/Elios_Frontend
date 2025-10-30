// file: elios_FE/src/forum/pages/PostDetail.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Card, Button } from "react-bootstrap";
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

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [loading, setLoading] = useState(true);

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

        // **MODIFICATION START**: Get current user's info from localStorage
        let currentUserName = "You";
        let currentUserAvatar = "/default-avatar.png";

        try {
            // Assumes user info is stored under the key 'user' in localStorage.
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const userData = JSON.parse(storedUser);
                // NOTE: Adjust 'fullName' and 'avatarUrl' if your stored object uses different keys.
                currentUserName = userData.fullName || "You";
                currentUserAvatar = userData.avatarUrl || "/default-avatar.png";
            }
        } catch (e) {
            console.error("Could not parse user data from localStorage for optimistic comment.", e);
        }
        // **MODIFICATION END**

        const tempId = `temp-${Date.now()}`;
        const tempComment = {
            commentId: tempId,
            content: content,
            createdAt: new Date().toISOString(),
            // **MODIFICATION**: Use the retrieved user data instead of placeholders
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
            // console.error("❌ Error creating comment:", error);
            // setPost(currentPost => {
            //     const removeComment = (comments) => comments
            //         .filter(c => c.commentId !== tempId)
            //         .map(c => ({ ...c, replies: c.replies ? removeComment(c.replies) : [] }));
                
            //     return { ...currentPost, comments: removeComment(currentPost.comments) };
            // });
            // alert("Sorry, your comment could not be posted. Please try again.");
        }
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
                        <Button variant="link" size="sm" className="p-0 mt-1 reply-button" onClick={() => handleSetReply(comment)}>
                            Reply
                        </Button>
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
                        <img src={post.authorAvatarUrl} alt="user" className="post-avatar" />
                        <div>
                            <h5 className="mb-0 post-author">{post.authorFullName}</h5>
                            <small className="post-time">{formatRelativeTime(post.createdAt)}</small>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <h3 className="post-title">{post.title}</h3>
                        <div className="markdown-content mb-4">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                                {post.content}
                            </ReactMarkdown>
                        </div>
                        {post.url && post.url.length > 0 && (
                            <div className="text-center my-3">
                                {post.url.map((img, index) => <img key={index} src={img} alt="post media" className="img-fluid rounded mb-2" />)}
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