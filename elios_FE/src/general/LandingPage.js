// FRONT-END: elios_FE/src/general/LandingPage.js
import React from "react";
import { Container, Row, Col, Button, Navbar, Nav, Spinner } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserProfile } from "../hooks/useUserProfile";
import {
  BsChatSquareDots,
  BsCodeSlash,
  BsFileEarmarkPerson,
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

  // Xây dựng link theo role
  const getNavbarLinks = () => {
    const isUser = !user || user.role === "User" || !user.role;

    // Chỉ User mới thấy các link cơ bản
    const baseLinks = isUser
      ? [
        { href: "/forum", label: "Diễn Đàn" },
        { href: "/codingchallenge", label: "Thử Thách Lập Trình" },
        { href: "/resume-builder", label: "Tạo CV" },
        { href: "/mock-projects", label: "Dự Án Thực Hành" },
      ]
      : [];

    // Các role đặc biệt: thêm link quản lý
    const extraLinks = [];

    if (user?.role === "Resource Manager") {
      extraLinks.push(
        { href: "/manage-coding-bank", label: "Quản lý Ngân hàng Đề Code" },
        { href: "/manage-project-bank", label: "Quản lý Ngân hàng Dự án" },
        { href: "/manage-interviews", label: "Quản lý Phỏng vấn" },
        { href: "/manage-prompts", label: "Quản lý Prompt" }
      );
    }

    if (user?.role === "Content Moderator") {
      extraLinks.push({ href: "/manage-forum", label: "Quản lý Diễn đàn" });
    }

    if (user?.role === "Admin") {
      extraLinks.push(
        { href: "/manage-coding-bank", label: "Quản lý Ngân hàng Đề Code" },
        { href: "/manage-project-bank", label: "Quản lý Ngân hàng Dự án" },
        { href: "/content-moderator", label: "Quản lý Diễn đàn" },
      );
    }

    return [...baseLinks, ...extraLinks];
  };

  const navbarLinks = getNavbarLinks();

  return (
    <div id="landing-bg-landingPage">
      {/* Header Section */}
      <div id="header-section-landingPage">
        <Navbar expand="lg" id="navbar-custom-landingPage">
          <Navbar.Brand href="#">
            <img src="/assets/logo/logo1.png" alt="Logo" id="logo-img" />
          </Navbar.Brand>

          <Nav className="ml-auto" id="nav-links-landingPage">

            {/* Language Switcher */}
            {/* <Nav.Link onClick={toggleLanguage} style={{ cursor: "pointer" }}>
              {t("landingPage.navbar.language")}
            </Nav.Link> */}

            {/* Trạng thái đăng nhập */}
            {profileLoading ? (
              <Nav.Link disabled>
                <Spinner animation="border" size="sm" /> Đang tải ...
              </Nav.Link>
            ) : !user ? (
              <>
                <Nav.Link
                  onClick={() => navigate("/forum")}
                  style={{ cursor: "pointer" }}
                >
                  Diễn Đàn
                </Nav.Link>
                <Nav.Link
                  onClick={() => navigate("/codingChallenge")}
                  style={{ cursor: "pointer" }}
                >
                  Thử Thách Lập Trình
                </Nav.Link>
                <Nav.Link
                  onClick={() => (window.location.href = API_ENDPOINTS.LOGIN_PATH)}
                  style={{ cursor: "pointer" }}
                >
                  Đăng nhập
                </Nav.Link>
              </>
            ) : (
              <>
                {navbarLinks.map((link, idx) => (
                  <Nav.Link key={idx} href={link.href}>
                    {link.label}
                  </Nav.Link>
                ))}
                <Nav.Link as={Link} to="/user/profile">
                  Trang Cá Nhân
                </Nav.Link>
                <Nav.Link as={Link} to="/interview">
                  Phỏng Vấn Thử Với AI
                </Nav.Link>
                <Nav.Link
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = API_ENDPOINTS.LOGOUT_PATH;
                  }}
                  style={{ cursor: "pointer" }}
                >
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
              <p id="main-desc-landingPage">Eliso là nền tảng tốt nhất giúp bạn nâng cao kỹ năng, mở rộng kiến thức và chuẩn bị cho các buổi phỏng vấn kỹ thuật. </p>

              {/* Nút Get Started */}
              {profileLoading ? (
                <Button variant="success" disabled>
                  <Spinner animation="border" size="sm" /> Đang tải ...
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
                  to={user.role === "User" ? "/mock-projects" : "/dashboard"}
                >
                  {user.role === "User" ? "Đi đến Dự Án Thực Hành" : "Go to Dashboard"} &gt;
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </div>

      {/* Explore Section – Chỉ hiển thị cho User hoặc chưa login */}
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
              {/* 
              <Col md={4} className="h-100">
                <div id="feature-card-cv">
                  <BsFileEarmarkPerson id="cv-icon" />
                  <h4 id="cv-title">{t("landingPage.explore.cv_title")}</h4>
                  <p id="cv-desc">{t("landingPage.explore.cv_desc")}</p>
                  <Link to="/resume-builder" id="cv-link">
                    {t("landingPage.explore.cv_link")} &gt;
                  </Link>
                </div>
              </Col> */}
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