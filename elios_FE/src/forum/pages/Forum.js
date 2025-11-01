// FRONT-END: elios_FE/src/forum/pages/Forum.js
import React, { useContext, useEffect, useState } from "react"; // Import useContext
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import UserNavbar from "../../components/navbars/UserNavbar";
import CreatePostModal from "../components/CreatePostModal";
import { formatRelativeTime } from "../utils/formatTime";
import { FaEye, FaCommentAlt, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import "../style/Forum.css";
import LoadingCircle1 from "../../components/loading/LoadingCircle1";
import { ForumContext } from "../context/ForumContext"; // Import the context

const Forum = () => {
  const navigate = useNavigate();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const { posts, loading } = useContext(ForumContext);

  const isContentTooLong = (content) => {
    return content.length > 300;
  };

  const truncateContent = (content) => {
    if (content.length > 300) {
      return content.slice(0, 300);
    }
    return content;
  };

  const openPost = (post) => {
    navigate(`/forum/post/${post.postId}`, { state: { post } });
  };

  return (
    <>
      <header>
        <UserNavbar />
      </header>

      <main>
        <div className="user-forum-bg">
          <Container fluid className="user-forum-container">
            <Row className="user-forum-content-center">
              <Col md={9} className="user-forum-forum-main">
                {loading ? (
                  <LoadingCircle1 />
                ) : (
                  // **MODIFICATION**: Map over 'posts' from context
                  posts.map((post) => (
                    <Card
                      key={post.postId}
                      className="user-forum-forum-post mb-3"
                      onClick={() => openPost(post)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* ... Card content remains the same ... */}
                      <Card.Body>
                        <div className="user-forum-forum-post-meta">
                          <img
                            src={post.authorAvatarUrl}
                            alt="user"
                            className="user-forum-forum-avatar"
                          />
                          <span className="user-forum-forum-user">
                            {post.authorFullName}
                          </span>
                          <span className="user-forum-forum-time">
                            {formatRelativeTime(post.createdAt)}
                          </span>
                        </div>

                        <Card.Title>
                          <span className="user-forum-forum-link">{post.title}</span>
                        </Card.Title>

                        <Card.Text as="div" className="user-forum-forum-content">
                          <div>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{ p: "span" }}
                            >
                              {truncateContent(post.content)}
                            </ReactMarkdown>

                            {isContentTooLong(post.content) && (
                              <span
                                className="user-forum-view-more"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openPost(post);
                                }}
                              >
                                {" ...view more"}
                              </span>
                            )}
                          </div>
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
                            <span className="stat-item view">
                              <FaEye /> {post.viewsCount}
                            </span>
                          </div>
                        </Card.Text>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </Col>

              <Col md={3} className="user-forum-forum-sidebar">
                 <Card className="user-forum-sidebar-card">
                  <Card.Body>
                    <div className="user-forum-sidebar-banner mb-3">
                      <img
                        src="https://leetcode.com/static/images/crash-course-banner.png"
                        alt="Crash Course"
                        className="user-forum-sidebar-banner-img"
                      />
                      <Button
                        variant="outline-light"
                        size="sm"
                        className="w-100 mb-2 user-forum-btn-outline-light"
                      >
                        Start Learning
                      </Button>
                    </div>

                    <div className="user-forum-sidebar-section">
                      <div
                        className="user-forum-sidebar-title"
                        onClick={() => setShowCreatePostModal(true)}
                      >
                        <span role="img" aria-label="chat">
                          
                        </span>{" "}
                        Discuss Now
                      </div>
                      <Button
                        variant="outline-light"
                        size="sm"
                        className="w-100 mb-2 user-forum-btn-outline-light"
                        onClick={() => setShowCreatePostModal(true)}
                      >
                        Let's Discuss
                      </Button>
                    </div>


                    <ListGroup variant="flush" className="mt-3">
                      <ListGroup.Item className="user-forum-sidebar-list">
                        OO Design
                      </ListGroup.Item>
                      <ListGroup.Item className="user-forum-sidebar-list">
                        Operating System
                      </ListGroup.Item>
                      <ListGroup.Item className="user-forum-sidebar-list">
                        Algorithms
                      </ListGroup.Item>
                      <ListGroup.Item className="user-forum-sidebar-list">
                        Database
                      </ListGroup.Item>
                      <ListGroup.Item className="user-forum-sidebar-list">
                        Shell
                      </ListGroup.Item>
                      <ListGroup.Item className="user-forum-sidebar-list">
                        Concurrency
                      </ListGroup.Item>
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </main>

      <CreatePostModal
        show={showCreatePostModal}
        handleClose={() => setShowCreatePostModal(false)}
      />
    </>
  );
};

export default Forum;