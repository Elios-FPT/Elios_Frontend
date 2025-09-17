// FRONT-END: elios_FE/src/general/Home.js
import React from "react";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Home = () => {
  const { t, i18n } = useTranslation();

  // toggle between English and Vietnamese
  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "vi" : "en");
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>{t("cv_generator")}</h1>
          <p>{t("welcome")}</p>
          <p>{t("generate_now", "Generate a CV now")}</p>
          <Link to="/editor">
            <button>{t("get_started", "Get Started")}</button>
          </Link>
          <div style={{ marginTop: "20px" }}>
            <button onClick={toggleLanguage}>
              {t("switch_language")}
            </button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
