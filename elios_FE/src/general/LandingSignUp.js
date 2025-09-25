// FRONT-END: elios_FE/src/general/LandingSignUp.js
import React from "react";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import { useTranslation } from "react-i18next"; // ✅ add i18n
import "../styles/LandingSignUp.css";

const LandingSignUp = () => {
  const { t } = useTranslation();

  return (
    <div className="signup-bg-landing-signup">
      <Container>
        <Row className="justify-content-center align-items-center min-vh-100">
          <Col md={5}>
            <Card className="signup-card p-4">
              <div className="text-center mb-3">
                <img
                  src="/assets/logo/logo1.png"
                  alt="Logo"
                  className="signup-logo-landing-signup"
                />
                <div className="signup-title-landing-signup">
                  {t("landingSignUp.title")}
                </div>
              </div>
              <Form>
                <Form.Group className=" input-group mb-3">
                  <Form.Control type="text" placeholder={t("landingSignUp.username")} />
                </Form.Group>
                <Form.Group className="input-group mb-3">
                  <Form.Control type="password" placeholder={t("landingSignUp.password")} />
                </Form.Group>
                <Form.Group className="input-group mb-3">
                  <Form.Control type="password" placeholder={t("landingSignUp.confirmPassword")} />
                </Form.Group>
                <Form.Group className="input-group mb-3">
                  <Form.Control type="email" placeholder={t("landingSignUp.email")} />
                </Form.Group>
                <div className="mb-3">
                  <Card className="success-card p-2">
                    <Row className="align-items-center">
                      <Col xs="auto">
                        <span className="success-icon">&#10004;</span>
                      </Col>
                      <Col>
                        <span>{t("landingSignUp.success")}</span>
                      </Col>
                      <Col xs="auto">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Cloudflare_Logo.png"
                          alt="Cloudflare"
                          className="cloudflare-logo"
                        />
                      </Col>
                    </Row>
                  </Card>
                </div>
                <Button className="signup-btn-landing" type="submit">
                  {t("landingSignUp.signUpBtn")}
                </Button>
              </Form>
              <div className="mt-3 text-center">
                <span>{t("landingSignUp.haveAccount")} </span>
                <a href="#" className="signin-link-landing-signup">
                  {t("landingSignUp.signIn")}
                </a>
              </div>
              <div className="mt-2 text-center text-muted" style={{ fontSize: "0.95rem" }}>
                {t("landingSignUp.orSignInWith")}
              </div>
              <div className="d-flex justify-content-center gap-3 mt-2">
                <span className="social-icon">&#x1F310;</span>
                <span className="social-icon">&#xf09b;</span>
                <span className="social-icon">&#xf09a;</span>
              </div>
            </Card>
          </Col>
        </Row>
        <footer className="signup-footer-landing-signup">
          <div>
            {t("landingSignUp.footer")}
          </div>
          <div className="country-select-landing-signup">
            <span role="img" aria-label="US">🇺🇸</span> {t("landingSignUp.country")}
          </div>
        </footer>
      </Container>
    </div>
  );
};

export default LandingSignUp;
