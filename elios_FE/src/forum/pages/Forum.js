// FRONT-END: elios_FE/src/forum/pages/Forum.js
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Card, Button, ListGroup, Pagination } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import UserNavbar from "../../components/navbars/UserNavbar";
import CreatePostModal from "../components/CreatePostModal";
import { formatRelativeTime } from "../utils/formatTime";
import { FaEye, FaCommentAlt, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import "../style/Forum.css";
import LoadingCircle1 from "../../components/loading/LoadingCircle1";
import { ForumContext } from "../context/ForumContext";

const Forum = () => {
  const navigate = useNavigate();
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  
  const { 
    posts, 
    loading, 
    categories, 
    setCategoryId, 
    currentPage, 
    setCurrentPage, 
    totalPages 
  } = useContext(ForumContext);

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

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the post list
    const mainContent = document.getElementById("user-forum-forum-main");
    if(mainContent) {
        mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header>
        
      </header>

      <main>
        <div id="user-forum-bg">
          <Container fluid id="user-forum-container">
            <Row id="user-forum-content-center">
              <Col md={9} id="user-forum-forum-main">
                {loading ? (
                  <LoadingCircle1 />
                ) : (
                  <>
                    {posts.map((post) => (
                      <Card
                        key={post.postId}
                        id="user-forum-forum-post"
                        className="mb-3"
                        onClick={() => openPost(post)}
                        style={{ cursor: "pointer" }}
                      >
                        <Card.Body>
                          <div id="user-forum-forum-post-meta">
                            <img
                              src={post.authorAvatarUrl}
                              alt="user"
                              id="user-forum-forum-avatar"
                            />
                            <span id="user-forum-forum-user">
                              {post.authorFullName}
                            </span>
                            <span id="user-forum-forum-time">
                              {formatRelativeTime(post.createdAt)}
                            </span>
                          </div>

                          <Card.Title>
                            <span id="user-forum-forum-link">{post.title}</span>
                          </Card.Title>

                          <Card.Text as="div" id="user-forum-forum-content">
                            <div>
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{ p: "span" }}
                              >
                                {truncateContent(post.content)}
                              </ReactMarkdown>

                              {isContentTooLong(post.content) && (
                                <span
                                  id="user-forum-view-more"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openPost(post);
                                  }}
                                >
                                  {" ...view more"}
                                </span>
                              )}
                            </div>
                            <div id="user-forum-post-stats">
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
                    ))}

                    {/* Pagination Section */}
                    {totalPages > 1 && (
                      <div className="d-flex justify-content-center mt-4 mb-4">
                        <Pagination id="user-forum-pagination">
                          <Pagination.First 
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                          />
                          <Pagination.Prev 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          />
                          
                          {/* Logic to show a reasonable number of pages could go here */}
                          {/* For simple implementation, we show current and neighbors */}
                           {[...Array(totalPages)].map((_, idx) => {
                              const page = idx + 1;
                              // Show first, last, current, and immediate neighbors
                              if (
                                page === 1 || 
                                page === totalPages || 
                                (page >= currentPage - 1 && page <= currentPage + 1)
                              ) {
                                return (
                                  <Pagination.Item 
                                    key={page} 
                                    active={page === currentPage}
                                    onClick={() => handlePageChange(page)}
                                  >
                                    {page}
                                  </Pagination.Item>
                                );
                              }
                              // Add ellipsis logic if needed, omitted for simplicity
                              return null;
                           })}

                          <Pagination.Next 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          />
                          <Pagination.Last 
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                          />
                        </Pagination>
                      </div>
                    )}
                  </>
                )}
              </Col>

              <Col md={3} id="user-forum-forum-sidebar">
                <Card id="user-forum-sidebar-card">
                  <Card.Body>
                    <div className="user-forum-sidebar-banner mb-3">
                      <Button
                        variant="outline-light"
                        size="sm"
                        className="w-100 mb-2"
                        id="user-forum-btn-outline-light"
                      >
                        Your Notification
                      </Button>
                    </div>

                    <div id="user-forum-sidebar-section">
                      <div
                        id="user-forum-sidebar-title"
                        onClick={() => setShowCreatePostModal(true)}
                      >
                        <span role="img" aria-label="chat"></span>{" "}
                        Discuss Now
                      </div>
                      <Button
                        variant="outline-light"
                        size="sm"
                        className="w-100 mb-2"
                        id="user-forum-btn-outline-light"
                        onClick={() => navigate("/forum/user-posts")}
                      >
                        Your Post Storage
                      </Button>
                    </div>

                    <ListGroup variant="flush" className="mt-3">
                      <div className="user-forum-sidebar-banner mb-3">
                        <div id="user-forum-sidebar-title">
                          Topics
                        </div>
                      </div>
                      
                      <ListGroup.Item 
                        className="user-forum-sidebar-list"
                        action
                        onClick={() => setCategoryId(null)}
                        style={{ cursor: 'pointer' }}
                      >
                        All Topics
                      </ListGroup.Item>

                      {categories && categories.slice(0, 12).map((category) => (
                        <ListGroup.Item 
                          key={category.categoryId}
                          className="user-forum-sidebar-list"
                          action
                          onClick={() => setCategoryId(category.categoryId)}
                          style={{ cursor: 'pointer' }}
                        >
                          {category.name}
                        </ListGroup.Item>
                      ))}
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