// FRONT-END: elios_FE/src/general/LandingSignUp.js
import React from "react";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../styles/LandingSignIn.css";

const LandingSignIn = () => {
  const { t } = useTranslation();

  return (
    <div className="signin-bg-landing-signin">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={5}>
            <Card className="signin-card-landing-signin p-4">
              <div className="text-center mb-3">
                <img
                  src="/assets/logo/logo1.png"
                  alt="Logo"
                  className="signin-logo-landing-signin"
                />
                <div className="signin-title-landing-signin">
                  {t("landingSignIn.title")}
                </div>
              </div>
              <Form>
                <Form.Group className="input-group mb-3">
                  <Form.Control
                    type="text"
                    placeholder={t("landingSignIn.username")}
                  />
                </Form.Group>
                <Form.Group className="input-group mb-3">
                  <Form.Control
                    type="password"
                    placeholder={t("landingSignIn.password")}
                  />
                </Form.Group>
                <Button className="signin-btn-landing" type="submit">
                  {t("landingSignIn.signInBtn")}
                </Button>
              </Form>
              <div className="mt-3 text-center">
                <span>{t("landingSignIn.noAccount")} </span>
                <Link to="/accounts/signup" className="signup-link-landing-signin">
                  {t("landingSignIn.signUp")}
                </Link>
              </div>
              <div
                className="mt-2 text-center text-muted"
                style={{ fontSize: "0.95rem" }}
              >
                {t("landingSignIn.orSignInWith")}
              </div>
              <div className="d-flex justify-content-center gap-3 mt-2">
                <span className="social-icon-landing-signin">&#x1F310;</span>
                <span className="social-icon-landing-signin">&#xf09b;</span>
                <span className="social-icon-landing-signin">&#xf09a;</span>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
      <footer className="signin-footer-landing-signin">
        <div>{t("landingSignIn.footer")}</div>
        <div className="country-select-landing-signin">
          <span role="img" aria-label="US">
            🇺🇸
          </span>{" "}
          {t("landingSignIn.country")}
        </div>
      </footer>
    </div>
  );
};

export default LandingSignIn;
