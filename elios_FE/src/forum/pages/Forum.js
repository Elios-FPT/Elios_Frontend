// FRONT-END: elios_FE/src/forum/pages/Forum.js
import React, { useState } from "react";
import { Container, Row, Col, Card, Button, ListGroup } from "react-bootstrap";
import "../style/Forum.css";
import UserNavbar from "../../components/navbars/UserNavbar";
import PostModal from "../components/PostModal";
import mockPosts from "../data/mockPosts.json";
import { formatRelativeTime } from "../utils/formatTime";

const Forum = () => {
  const [selectedPost, setSelectedPost] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
    setSelectedPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setShowModal(false);
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
                {mockPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="user-forum-forum-post mb-3"
                    onClick={() => openPost(post)}
                    style={{ cursor: "pointer" }}
                  >
                    <Card.Body>
                      <div className="user-forum-forum-post-meta">
                        <img
                          src={post.user.avatar}
                          alt="user"
                          className="user-forum-forum-avatar"
                        />
                        <span className="user-forum-forum-user">
                          {post.user.name}
                        </span>
                        <span className="user-forum-forum-time">
                          {formatRelativeTime(post.time)}
                        </span>
                      </div>

                      <Card.Title>
                        <span className="user-forum-forum-link">{post.title}</span>
                      </Card.Title>

                      <Card.Text className="user-forum-forum-content">
                        {truncateContent(post.content)}
                        {isContentTooLong(post.content) && (
                          <span
                            className="user-forum-view-more"
                            onClick={(e) => {
                              e.stopPropagation();
                              openPost(post);
                            }}
                          >
                            ...view more
                          </span>
                        )}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ))}
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
                      <div className="user-forum-sidebar-title">
                        <span role="img" aria-label="chat">
                          💬
                        </span>{" "}
                        Discuss Now
                      </div>
                      <Button
                        variant="outline-light"
                        size="sm"
                        className="w-100 mb-2 user-forum-btn-outline-light"
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

      <PostModal show={showModal} handleClose={closeModal} post={selectedPost} />
    </>
  );
};

export default Forum;