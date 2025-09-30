// FRONT-END: elios_FE/src/pages/userPage/UserForum.js
import React from 'react';
import { Container, Row, Col, Card, Button, ListGroup } from 'react-bootstrap';
import '../../styles/UserForum.css';
import UserNavbar from '../../components/navbars/UserNavbar';

const UserForum = () => {

    const mockPosts = [
        {
            id: 1,
            user: "LeetCode",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png",
            time: "6 days ago",
            title: "What to ⭐ Ask Leet. Share Story and Win Prizes 🎁",
            text: "👋 Hello LeetCoders! We're excited to introduce a new feature to your coding experience: Leet. Leet is designed to help you explore ideas, fix bugs faster, and refine your coding...",
        },
        {
            id: 2,
            user: "LeetCode",
            avatar: "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png",
            time: "a year ago",
            title: "Feature Release Notes",
            text: "📅 2025.8~9",
            image: "https://assets.leetcode.com/static_assets/public/images/landing/explore-icon.png",
        },
        {
            id: 3,
            user: "Jane Doe",
            avatar: "https://i.pravatar.cc/100?img=5",
            time: "2 hours ago",
            title: "Tips for Solving Dynamic Programming Problems",
            text: "Dynamic programming can be tricky. I usually start by identifying overlapping subproblems and then move to memoization. Anyone has better strategies?",
        },
        {
            id: 4,
            user: "John Smith",
            avatar: "https://i.pravatar.cc/100?img=8",
            time: "3 days ago",
            title: "Best Resources for System Design",
            text: "I’ve been preparing for system design interviews. Do you recommend Grokking or YouTube playlists?",
        },
    ];



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

                                {/* Example forum posts */}
                                {mockPosts.map(post => (
                                    <Card key={post.id} className="user-forum-forum-post mb-3">
                                        <Card.Body>
                                            <div className="user-forum-forum-post-meta">
                                                <img src={post.avatar} alt="user" className="user-forum-forum-avatar" />
                                                <span className="user-forum-forum-user">{post.user}</span>
                                                <span className="user-forum-forum-time">{post.time}</span>
                                            </div>
                                            <Card.Title>
                                                <a href="#" className="user-forum-forum-link">{post.title}</a>
                                            </Card.Title>
                                            <Card.Text>
                                                {post.text}
                                            </Card.Text>
                                            {post.image && (
                                                <div className="user-forum-forum-img-center">
                                                    <img src={post.image} alt="post" className="user-forum-forum-img" />
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                ))}

                                {/* Add more posts as needed */}
                            </Col>
                            <Col md={3} className="user-forum-forum-sidebar">
                                <Card className="user-forum-sidebar-card">
                                    <Card.Body>
                                        <div className="user-forum-sidebar-banner mb-3">
                                            <img src="https://leetcode.com/static/images/crash-course-banner.png" alt="Crash Course" className="user-forum-sidebar-banner-img" />
                                            <Button variant="outline-light" size="sm" className="w-100 mb-2 user-forum-btn-outline-light">Start Learning</Button>
                                        </div>
                                        <div className="user-forum-sidebar-section">
                                            <div className="user-forum-sidebar-title">
                                                <span role="img" aria-label="trophy">🏆</span> LeetCode Contest
                                            </div>
                                            <Button variant="outline-light" size="sm" className="w-100 mb-2 user-forum-btn-outline-light">Join Contest</Button>
                                        </div>
                                        <div className="user-forum-sidebar-section">
                                            <div className="user-forum-sidebar-title">
                                                <span role="img" aria-label="chat">💬</span> Discuss Now
                                            </div>
                                            <Button variant="outline-light" size="sm" className="w-100 mb-2 user-forum-btn-outline-light">Let's Discuss</Button>
                                        </div>
                                        <div className="user-forum-sidebar-section">
                                            <div className="user-forum-sidebar-title">
                                                <span role="img" aria-label="coin">🪙</span> Shop with LeetCoins
                                            </div>
                                            <Button variant="outline-light" size="sm" className="w-100 mb-2 user-forum-btn-outline-light">Redeem</Button>
                                        </div>
                                        <ListGroup variant="flush" className="mt-3">
                                            <ListGroup.Item className="user-forum-sidebar-list">OO Design</ListGroup.Item>
                                            <ListGroup.Item className="user-forum-sidebar-list">Operating System</ListGroup.Item>
                                            <ListGroup.Item className="user-forum-sidebar-list">Algorithms</ListGroup.Item>
                                            <ListGroup.Item className="user-forum-sidebar-list">Database</ListGroup.Item>
                                            <ListGroup.Item className="user-forum-sidebar-list">Shell</ListGroup.Item>
                                            <ListGroup.Item className="user-forum-sidebar-list">Concurrency</ListGroup.Item>
                                        </ListGroup>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </Container>
                </div>
            </main>
            <footer>
                {/* Optional footer */}
            </footer>
        </>
    );
};

export default UserForum;
