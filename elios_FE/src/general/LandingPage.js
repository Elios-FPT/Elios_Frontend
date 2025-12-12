// FRONT-END: elios_FE/src/general/LandingPage.js
import React from "react";
import { Container, Row, Col, Button, Navbar, Nav, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
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
  const { t, i18n } = useTranslation();
  const { user, loading: profileLoading } = useUserProfile();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "vi" : "en");
  };

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
        { href: "/forum", label: t("landingPage.navbar.forum") },
        { href: "/codingchallenge", label: t("landingPage.navbar.codingChallenge") },
        { href: "/resume-builder", label: t("landingPage.navbar.buildCV") },
        { href: "/mock-projects", label: t("landingPage.navbar.projectChallenge") || "Project Challenge" },
      ]
      : [];

    // Các role đặc biệt: thêm link quản lý
    const extraLinks = [];

    if (user?.role === "Resource Manager") {
      extraLinks.push(
        { href: "/manage-coding-bank", label: "Manage Coding Bank" },
        { href: "/manage-project-bank", label: "Manage Project Bank" },
        { href: "/manage-interviews", label: "Manage Interviews" },
        { href: "/manage-prompts", label: "Manage Prompts" }
      );
    }

    if (user?.role === "Content Moderator") {
      extraLinks.push({ href: "/manage-forum", label: "Manage Forum" });
    }

    if (user?.role === "Admin") {
      extraLinks.push(
        { href: "/manage-coding-bank", label: "Manage Coding Bank" },
        { href: "/manage-project-bank", label: "Manage Project Bank" },
        { href: "/manage-forum", label: "Manage Forum" },
        { href: "/admin-dashboard", label: "Admin Dashboard" }
      );
    }

    return [...baseLinks, ...extraLinks];
  };

  const navbarLinks = getNavbarLinks();

  return (
    <div id="landing-bg-landingPage">
      {/* Header Section */}
      <div id="header-section-landingPage">
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
              <h1 id="main-title-landingPage">{t("landingPage.main_title")}</h1>
              <p id="main-desc-landingPage">{t("landingPage.main_desc")}</p>

              {/* Nút Get Started */}
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
                  {t("landingPage.get_started")} &gt;
                </Button>
              ) : (
                <Button
                  variant="success"
                  id="landingPage_signin_button"
                  as={Link}
                  to={user.role === "User" ? "/mock-projects" : "/dashboard"}
                >
                  {user.role === "User" ? "Go to Projects" : "Go to Dashboard"} &gt;
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
                  {t("landingPage.explore_title")}
                </h3>
              </Col>
            </Row>

            <Row className="justify-content-center" id="feature-card-row">
              <Col md={4} className="h-100">
                <div id="feature-card-forum">
                  <BsChatSquareDots id="forum-icon" />
                  <h4 id="forum-title">{t("landingPage.explore.forum_title")}</h4>
                  <p id="forum-desc">{t("landingPage.explore.forum_desc")}</p>
                  <Link to="/forum" id="forum-link">
                    {t("landingPage.explore.forum_link")} &gt;
                  </Link>
                </div>
              </Col>

              <Col md={4} className="h-100">
                <div id="feature-card-challenge">
                  <BsCodeSlash id="challenge-icon" />
                  <h4 id="challenge-title">{t("landingPage.explore.challenge_title")}</h4>
                  <p id="challenge-desc">{t("landingPage.explore.challenge_desc")}</p>
                  <Link to="/codingChallenge" id="challenge-link">
                    {t("landingPage.explore.challenge_link")} &gt;
                  </Link>
                </div>
              </Col>

              <Col md={4} className="h-100">
                <div id="feature-card-cv">
                  <BsFileEarmarkPerson id="cv-icon" />
                  <h4 id="cv-title">{t("landingPage.explore.cv_title")}</h4>
                  <p id="cv-desc">{t("landingPage.explore.cv_desc")}</p>
                  <Link to="/resume-builder" id="cv-link">
                    {t("landingPage.explore.cv_link")} &gt;
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
              <h4 id="creator-title-landingPage">{t("landingPage.creator.creator_Tilte")}</h4>
              <p className="text-muted">{t("landingPage.creator.creator_subTile")}</p>
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