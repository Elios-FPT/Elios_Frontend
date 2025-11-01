// FRONT-END: elios_FE/src/general/LandingPage.js
import React from "react";
import { Container, Row, Col, Button, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BsChatSquareDots,
  BsCodeSlash,
  BsFileEarmarkPerson,
} from "react-icons/bs";
import "../styles/LandingPage.css";
import { API_ENDPOINTS } from "../api/apiConfig";

const LandingPage = () => {
  const { t, i18n } = useTranslation();

  // Toggle between EN and VI
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div id="landing-bg-landingPage">
      {/* Header Section */}
      <div id="header-section-landingPage">
        <Navbar expand="lg" id="navbar-custom-landingPage">
          <Navbar.Brand href="#">
            <img
              src="/assets/logo/logo1.png"
              alt="Logo"
              id="logo-img"
            />
          </Navbar.Brand>
          <Nav className="ml-auto" id="nav-links-landingPage">
            {/* Updated navbar items */}
            <Nav.Link href="/forum">{t("landingPage.navbar.forum")}</Nav.Link>
            <Nav.Link href="/coding-challenge">{t("landingPage.navbar.codingChallenge")}</Nav.Link>
            <Nav.Link href="/resume-builder">{t("landingPage.navbar.buildCV")}</Nav.Link>

            {/* Language switcher */}
            <Nav.Link onClick={toggleLanguage} style={{ cursor: "pointer" }}>
              {t("landingPage.navbar.language")}
            </Nav.Link>

            {/* Login */}
            <Nav.Link
              onClick={() => (window.location.href = API_ENDPOINTS.LOGIN_PATH)}
              style={{ cursor: "pointer" }}
            >
              {t("landingPage.navbar.login")}
            </Nav.Link>
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
              <h1 id="main-title-landingPage">
                {t("landingPage.main_title")}
              </h1>
              <p id="main-desc-landingPage">
                {t("landingPage.main_desc")}
              </p>
              <Link onClick={() => (window.location.href = API_ENDPOINTS.LOGIN_PATH)}>
                <Button variant="success" id="landingPage_signin_button">
                  {t("landingPage.get_started")} &gt;
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </div>

     {/* Explore Section */}
      <div id="lower-section-landingPage">
        <Container>
          {/* Section Title */}
          <Row className="justify-content-center text-center">
            <Col md={10}>
              <h3 id="explore-title-landingPage">
                {t("landingPage.explore_title")}
              </h3>
            </Col>
          </Row>

          {/* Feature Cards Row */}
          <Row className="justify-content-center" id="feature-card-row">
            {/* Card 1: Forum */}
            <Col md={4} className="h-100">
              <div id="feature-card-forum">
                {/* --- UPDATED ICON --- */}
                <BsChatSquareDots id="forum-icon" />
                {/* --- END UPDATED ICON --- */}
                <h4 id="forum-title">
                  {t("landingPage.explore.forum_title")}
                </h4>
                <p id="forum-desc">
                  {t("landingPage.explore.forum_desc")}
                </p>
                <Link to="/forum" id="forum-link">
                  {t("landingPage.explore.forum_link")} &gt;
                </Link>
              </div>
            </Col>

            {/* Card 2: Coding Challenge */}
            <Col md={4} className="h-100">
              <div id="feature-card-challenge">
                {/* --- UPDATED ICON --- */}
                <BsCodeSlash id="challenge-icon" />
                {/* --- END UPDATED ICON --- */}
                <h4 id="challenge-title">
                  {t("landingPage.explore.challenge_title")}
                </h4>
                <p id="challenge-desc">
                  {t("landingPage.explore.challenge_desc")}
                </p>
                <Link to="/codingChallenge" id="challenge-link">
                  {t("landingPage.explore.challenge_link")} &gt;
                </Link>
              </div>
            </Col>

            {/* Card 3: Build CV */}
            <Col md={4} className="h-100">
              <div id="feature-card-cv">
                {/* --- UPDATED ICON --- */}
                <BsFileEarmarkPerson id="cv-icon" />
                {/* --- END UPDATED ICON --- */}
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

      {/* New: Creators Section (matching Vietnamese version) */}
      <div id="creator-section-landingPage" className="py-5 bg-light">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <h4 id="creator-title-landingPage">
                {t("landingPage.creator")}
              </h4>
              <p className="text-muted">
                Built with passion by the Elios team.
              </p>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default LandingPage;