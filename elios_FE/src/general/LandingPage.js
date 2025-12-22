// src/general/LandingPage.js
import React from "react";
import { Container, Row, Col, Button, Navbar, Nav, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  BsChatSquareDots,
  BsCodeSlash,
} from "react-icons/bs";
import "../styles/LandingPage.css";
import { API_ENDPOINTS } from "../api/apiConfig";

const LandingPage = () => {
  const { user, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  const creators = [
    { name: "Nguyễn Ngọc Tuấn Huy", quote: "Chill, dăm ba ChatGPT, tôi tạo chục con.", img: "https://via.placeholder.com/150" },
    { name: "Nguyễn Đăng Long", quote: "Cloudflare sập vì tôi bỏ họ ", img: "https://via.placeholder.com/150" },
    { name: "Phạm Minh Khánh", quote: "Cái răng cái tóc là phần quan trọng của bộ mặt con ngươi", img: "https://via.placeholder.com/150" },
    { name: "Tô Quang Huy", quote: "Không gì là không có thể không", img: "https://via.placeholder.com/150" },
    { name: "Nguyễn Tiến Hưng", quote: "Tôi chỉ cần nói một câu là gọi được vốn của nhà nước ngay", img: "https://via.placeholder.com/150" },
  ];

  // 1. Helper to determine where the "Get Started" button points to
  const getDashboardRoute = (role) => {
    switch (role) {
      case "Resource Manager":
        return "/manage-coding-bank";
      case "Content Moderator":
        return "/content-moderator";
      case "Admin":
        return "/manage-coding-bank"; // Or your specific Admin dashboard
      case "User":
      default:
        return "/mock-projects";
    }
  };

  // 2. Logic to build navbar links based on specific roles
  const getNavbarLinks = () => {
    // Links for Guests or standard Users
    const isStandardUser = !user || user.role === "User";
    const standardLinks = [
      { to: "/forum", label: "Diễn Đàn" },
      { to: "/codingchallenge", label: "Thử Thách Lập Trình" },
      { to: "/interview", label: "Phỏng Vấn" },
      { to: "/interview/history", label: "Lịch sử phỏng vấn" },
      { to: "/interview/my-reviews", label: "Đánh giá của tôi" }
    ];

    // Only show "Create CV" and "Projects" if actually logged in as a User
    if (user?.role === "User") {
      standardLinks.push(
        { to: "/resume-builder", label: "Tạo CV" },
        { to: "/mock-projects", label: "Dự Án Thực Hành" }
      );
    }

    // Role-Specific Links
    const managerLinks = [];

    if (user?.role === "Resource Manager") {
      managerLinks.push(
        { to: "/manage-coding-bank", label: "Q.Lý Code" },
        { to: "/manage-project-bank", label: "Q.Lý Dự Án" },
        { to: "/manage-interviews", label: "Q.Lý Phỏng Vấn" },
      );
    }

    if (user?.role === "Content Moderator") {
      // Points to the Layout route defined in App.js
      managerLinks.push({ to: "/content-moderator", label: "Kiểm Duyệt Diễn Đàn" });
    }

    if (user?.role === "Admin") {
      managerLinks.push(
        { to: "/manage-coding-bank", label: "Quản Lý Code" },
        { to: "/content-moderator", label: "Quản Lý Diễn Đàn" },
        { to: "/manage-prompts", label: "Q.Lý Prompt" }
      );
    }

    // If it's a manager, show manager links. If User/Guest, show standard links.
    // You can combine them if you want Managers to see Forum links too.
    return user && user.role !== "User" ? managerLinks : standardLinks;
  };

  const navbarLinks = getNavbarLinks();

  const handleLogout = () => {
    // Explicitly remove user data
    localStorage.removeItem("user");
    // Clear everything else
    localStorage.clear();
    // Redirect
    window.location.href = API_ENDPOINTS.LOGOUT_PATH;
  };

  return (
    <div id="landing-bg-landingPage">
      {/* Header Section */}
      <div id="header-section-landingPage">
        <Navbar expand="lg" id="navbar-custom-landingPage">
          <Navbar.Brand href="#">
            <img src="/assets/logo/logo1.png" alt="Logo" id="logo-img" />
          </Navbar.Brand>

          <Nav className="ml-auto" id="nav-links-landingPage">
            {profileLoading ? (
              <Nav.Link disabled>
                <Spinner animation="border" size="sm" /> Đang tải...
              </Nav.Link>
            ) : !user ? (
              // --- GUEST VIEW ---
              <>
                <Nav.Link as={Link} to="/forum">Diễn Đàn</Nav.Link>
                <Nav.Link as={Link} to="/codingChallenge">Thử Thách Lập Trình</Nav.Link>
                <Nav.Link onClick={() => (window.location.href = API_ENDPOINTS.LOGIN_PATH)} style={{ cursor: "pointer" }}>
                  Đăng nhập
                </Nav.Link>
              </>
            ) : (
              // --- LOGGED IN VIEW (All Roles) ---
              <>
                {navbarLinks.map((link, idx) => (
                  <Nav.Link key={idx} as={Link} to={link.to}>
                    {link.label}
                  </Nav.Link>
                ))}

                {/* Always show Profile for logged in users */}
                <Nav.Link as={Link} to="/user/profile">
                  Hồ Sơ
                </Nav.Link>

                <Nav.Link onClick={handleLogout} style={{ cursor: "pointer" }}>
                  Đăng xuất
                </Nav.Link>

              </>
            )}
          </Nav>
        </Navbar>

        <Container id="main-content-landingPage">
          <Row>
            <Col md={6} className="d-flex" id="align-items-center-landingPage">
              <img
                src="assets/general/Laptop1.png"
                alt="Dashboard"
                id="dashboard-img"
              />
            </Col>
            <Col md={6} id="text-section-landingPage">
              <h1 id="main-title-landingPage">Một cách học hoàn toàn mới</h1>
              <p id="main-desc-landingPage">Eliso là nền tảng tốt nhất giúp bạn nâng cao kỹ năng, mở rộng kiến thức và chuẩn bị cho các buổi phỏng vấn kỹ thuật.</p>

              {/* Call to Action Button */}
              {profileLoading ? (
                <Button variant="success" disabled>
                  <Spinner animation="border" size="sm" /> Loading...
                </Button>
              ) : !user ? (
                <Button
                  variant="success"
                  id="landingPage_signin_button"
                  onClick={() => (window.location.href = API_ENDPOINTS.LOGIN_PATH)}
                >
                  Bắt đầu ngay &gt;
                </Button>
              ) : (
                <Button
                  variant="success"
                  id="landingPage_signin_button"
                  as={Link}
                  to={getDashboardRoute(user.role)}
                >
                  {user.role === "User" ? "Đi đến Dự Án Thực Hành" : "Truy cập Trang Quản Lý"} &gt;
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Explore Section – Only show for Standard Users or Guests */}
      {(!user || user.role === "User") && (
        <div id="lower-section-landingPage">
          <Container>
            <Row className="justify-content-center text-center">
              <Col md={10}>
                <h3 id="explore-title-landingPage">
                  Khám phá ngay
                </h3>
              </Col>
            </Row>

            <Row className="justify-content-center" id="feature-card-row">
              <Col md={4} className="h-100">
                <div id="feature-card-forum">
                  <BsChatSquareDots id="forum-icon" />
                  <h4 id="forum-title">Diễn đàn</h4>
                  <p id="forum-desc">Nơi lập trình viên kết nối, chia sẻ kinh nghiệm, đặt câu hỏi và học hỏi từ cộng đồng mạnh mẽ hàng ngày.</p>
                  <Link to="/forum" id="forum-link">
                    Xem trang diễn đàn ngay &gt;
                  </Link>
                </div>
              </Col>

              <Col md={4} className="h-100">
                <div id="feature-card-challenge">
                  <BsCodeSlash id="challenge-icon" />
                  <h4 id="challenge-title">Thử thách lập trình</h4>
                  <p id="challenge-desc">Hàng trăm bài tập thực tế, từ cơ bản đến nâng cao, giúp bạn rèn luyện tư duy thuật toán và sẵn sàng cho mọi buổi phỏng vấn.</p>
                  <Link to="/codingChallenge" id="challenge-link">
                    Thử thách bản thân &gt;
                  </Link>
                </div>
              </Col>
            </Row>
          </Container>
        </div>
      )}

      {/* Creators Section */}
      <div id="creator-section-landingPage" className="py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col md={12} className="text-center mb-5">
              <h4 id="creator-title-landingPage">Những người tạo ra Elios</h4>
              <p className="text-muted">Kiến tạo bằng cả niểm đam mê bởi đội ngũ Elios</p>
            </Col>
          </Row>

          <Row className="justify-content-center" id="creator-card-row">
            {creators.map((dev, index) => (
              <Col key={index} lg={2} md={4} sm={6} xs={12} className="mb-4">
                <div className="creator-card">
                  <div
                    className="creator-avatar"
                    style={{ backgroundImage: `url(${dev.img})` }}
                  ></div>
                  <h5 className="creator-name">{dev.name}</h5>
                  <p className="creator-role">{dev.quote}</p>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default LandingPage;