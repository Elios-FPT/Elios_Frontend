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
        <Navbar expand="lg" id="navbar-custom-landingPage">
          <Navbar.Brand href="#">
            <img src="/assets/logo/logo1.png" alt="Logo" id="logo-img" />
          </Navbar.Brand>

          <Nav className="ml-auto" id="nav-links-landingPage">

            {/* Language Switcher */}
            <Nav.Link onClick={toggleLanguage} style={{ cursor: "pointer" }}>
              {t("landingPage.navbar.language")}
            </Nav.Link>

            {/* Trạng thái đăng nhập */}
            {profileLoading ? (
              <Nav.Link disabled>
                <Spinner animation="border" size="sm" /> Loading...
              </Nav.Link>
            ) : !user ? (
              <Nav.Link
                onClick={() => (window.location.href = API_ENDPOINTS.LOGIN_PATH)}
                style={{ cursor: "pointer" }}
              >
                {t("landingPage.navbar.login")}
              </Nav.Link>
            ) : (
              <>
                {navbarLinks.map((link, idx) => (
                  <Nav.Link key={idx} href={link.href}>
                    {link.label}
                  </Nav.Link>
                ))}
                <Nav.Link as={Link} to="/user/profile">
                  {t("UserNavbar.profile")}
                </Nav.Link>
                <Nav.Link as={Link} to="/interview">
                  Interviews
                </Nav.Link>
                <Nav.Link
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = API_ENDPOINTS.LOGOUT_PATH;
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {t("UserNavbar.logout")}
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
            <Col md={8} className="text-center">
              <h4 id="creator-title-landingPage">{t("landingPage.creator")}</h4>
              <p className="text-muted">Built with passion by the Elios team.</p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default LandingPage;