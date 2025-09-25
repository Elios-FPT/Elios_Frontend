// FRONT-END: elios_FE/src/general/LandingPage.js
import React from "react";
import { Container, Row, Col, Button, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"; // ✅ add i18n
import "../styles/LandingPage.css";

const LandingPage = () => {
  const { t, i18n } = useTranslation();

  // ✅ Toggle between EN and VI
  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="landing-bg-landingPage">
      {/* Header Section */}
      <div className="header-section-landingPage">
        <Navbar expand="lg" className="navbar-custom-landingPage">
          <Navbar.Brand href="#">
            <img
              src="/assets/logo/logo1.png"
              alt="Logo"
              className="logo-img"
            />
          </Navbar.Brand>
          <Nav className="ml-auto nav-links-landingPage">
            <Nav.Link href="#">{t("landingPage.navbar.premium")}</Nav.Link>
            <Nav.Link href="#">{t("landingPage.navbar.product")}</Nav.Link>
            <Nav.Link href="#">{t("landingPage.navbar.developer")}</Nav.Link>

            {/* ✅ Language switcher */}
            <Nav.Link onClick={toggleLanguage} style={{ cursor: "pointer" }}>
              {t("landingPage.navbar.language")}
            </Nav.Link>

            <Nav.Link as={Link} to="/accounts/login">
              {t("landingPage.navbar.login")}
            </Nav.Link>

          </Nav>
        </Navbar>

        <Container className="main-content-landingPage">
          <Row>
            <Col md={6} className="d-flex align-items-center-landingPage">
              <img
                src="assets/general/Laptop1.png"
                alt="Dashboard"
                className="dashboard-img"
              />
            </Col>
            <Col md={6} className="text-section-landingPage">
              <h1 className="main-title-landingPage">
                {t("landingPage.main_title")}
              </h1>
              <p className="main-desc-landingPage">
                {t("landingPage.main_desc")}
              </p>
              <Link to="/accounts/signup">
                <Button variant="success" className="cta-btn-landingPage">
                  {t("landingPage.create_account")} &nbsp; &gt;
                </Button>
              </Link>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Lower Section */}
      <div className="lower-section-landingPage">
        <Container>
          <Row className="justify-content-center">
            <Col md={8} className="text-center">
              <h3 className="explore-title-landingPage">
                {t("landingPage.explore_title")}
              </h3>
              <img
                src="https://assets.leetcode.com/static_assets/public/images/landing/explore-icon.png"
                alt="Explore Icon"
                className="explore-icon-landingPage"
              />
              <p className="explore-desc-landingPage">
                {t("landingPage.explore_desc")}
              </p>
              <a href="#" className="get-started-link-landingPage">
                {t("landingPage.get_started")} &nbsp; &gt;
              </a>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default LandingPage;
