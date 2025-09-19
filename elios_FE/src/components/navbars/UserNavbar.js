// FRONT-END: elios_FE/src/general/UserNavbar.js
import React from "react";
import { Container, Row, Col, Nav, Navbar, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "../../styles/UserNavbar.css";

const UserNavbar = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "vi" : "en");
  };
  
  return (
    <nav className="user-navbar">
      <Container fluid>
        <Row className="align-items-center">
          <Col xs="auto" className="user-navbar-navbar-logo">
            <Link to="/">
              <img
                src="../assets/logo/logo1.png"
                alt="Logo"
                className="user-navbar-logo-img"
              />
            </Link>
            <span className="user-navbar-logo-text">{t("ELIOS")}</span>
          </Col>

          <Col>
            <Nav className="user-navbar-navbar-links">
              <Nav.Link as={Link} to="/study">{t("study")}</Nav.Link>
              <Nav.Link as={Link} to="/practice">{t("practice")}</Nav.Link>
              <Nav.Link as={Link} to="/contest">{t("contest")}</Nav.Link>
              <Nav.Link as={Link} to="/challenge">{t("challenge")}</Nav.Link>
              <Nav.Link as={Link} to="/event">{t("event")}</Nav.Link>
              <Nav.Link as={Link} to="/ranking">{t("ranking")}</Nav.Link>
              <Nav.Link as={Link} to="/contributor">{t("contributor")}</Nav.Link>
              <Nav.Link as={Link} to="/share">{t("share")}</Nav.Link>
              <Nav.Link as={Link} to="/showroom">{t("showroom")}</Nav.Link>
            </Nav>
          </Col>

          <Col xs="auto" className="user-navbar-navbar-actions">
            <Button
              variant="secondary"
              size="sm"
              className="me-2"
              onClick={toggleLanguage}
            >
              {t("switch_language")}
            </Button>
            <Link to="/login" className="user-navbar-login-link">
              {t("login")}
            </Link>
            <Button variant="danger" className="user-navbar-register-btn">
              {t("register")}
            </Button>
          </Col>
        </Row>
      </Container>
    </nav>
  );
};

export default UserNavbar;
