// FRONT-END: elios_FE/src/general/UserNavbar.js
import React from "react";
import { Container, Row, Col, Nav, Navbar, Button, Dropdown } from "react-bootstrap";
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
          {/* Logo */}
          <Col xs="auto" className="user-navbar-navbar-logo">
            <Link to="/">
              <img
                src="../assets/logo/logo1.png"
                alt="Logo"
                className="user-navbar-logo-img"
              />
            </Link>
          </Col>

          {/* Middle Links */}
          <Col>
            <Nav className="user-navbar-navbar-links">
              <Nav.Link as={Link} to="/forum">{t("UserNavbar.forum")}</Nav.Link>
              <Nav.Link as={Link} to="/codingChallenge">{t("UserNavbar.codingChallenge")}</Nav.Link>
              {/* <Nav.Link as={Link} to="/contest">{t("UserNavbar.contest")}</Nav.Link>
              <Nav.Link as={Link} to="/challenge">{t("UserNavbar.challenge")}</Nav.Link>
              <Nav.Link as={Link} to="/event">{t("UserNavbar.event")}</Nav.Link>
              <Nav.Link as={Link} to="/ranking">{t("UserNavbar.ranking")}</Nav.Link>
              <Nav.Link as={Link} to="/contributor">{t("UserNavbar.contributor")}</Nav.Link>
              <Nav.Link as={Link} to="/share">{t("UserNavbar.share")}</Nav.Link> */}
              <Nav.Link as={Link} to="/cv-designer">{t("UserNavbar.buildCV")}</Nav.Link>

            </Nav>
          </Col>

          {/* Right side actions */}
          <Col xs="auto" className="user-navbar-navbar-actions">


            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" size="sm" id="dropdown-basic">
                ☰ Menu
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/login">{t("UserNavbar.login")}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/register">{t("UserNavbar.register")}</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={toggleLanguage}>
                  {t("UserNavbar.switch_language")}
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/profile">{t("UserNavbar.profile")}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/settings">{t("UserNavbar.settings")}</Dropdown.Item>
                <Dropdown.Item as={Link} to="/logout">{t("UserNavbar.logout")}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </Container>
    </nav>
  );
};

export default UserNavbar;
