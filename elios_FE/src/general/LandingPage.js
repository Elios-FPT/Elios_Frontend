// FRONT-END: elios_FE/src/general/LandingPage.js
import React from "react";
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import "../styles/LandingPage.css";

const LandingPage = () => {
  return (
    <div className="landing-bg">
      <Container fluid>
        <Row className="landing-row">
          {/* Left Side */}
          <Col md={6} className="landing-left">
            <h1>
              Nền tảng học lập trình<br />
              trực tuyến dành riêng<br />
              <span className="highlight">cho học sinh</span>
            </h1>
            <ul className="landing-features">
              <li>+ Học lập trình từ 0</li>
              <li>+ Khơi dậy đam mê công nghệ</li>
              <li>+ Chinh phục thế giới số, khẳng định bản thân</li>
              <li>+ Mở ra cơ hội việc làm hấp dẫn trong tương lai</li>
            </ul>
            <div className="landing-partners">
              <span>Đối tác của chúng tôi</span>
              <div className="partner-logos">
                <img src="/assets/logo/fpt.png" alt="FPT" />
                <img src="/assets/logo/fpt_poly.png" alt="FPT Polytechnic" />
                <img src="/assets/logo/edu.png" alt="Edu" />
                <img src="/assets/logo/funx.png" alt="FunX" />
              </div>
            </div>
          </Col>
          {/* Right Side */}
          <Col md={6} className="landing-right">
            <div className="login-card">
              <h5>Học lập trình cùng với hàng triệu người với CodeLearn</h5>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Tên tài khoản*" />
                </Form.Group>
                <Form.Group className="mb-3">
                  <InputGroup>
                    <Form.Control type="password" placeholder="Mật khẩu*" />
                    <InputGroup.Text>
                      <i className="bi bi-eye"></i>
                    </InputGroup.Text>
                  </InputGroup>
                  <div className="forgot-link">
                    <a href="#">Quên mật khẩu?</a>
                  </div>
                </Form.Group>
                <Button variant="primary" className="w-100 mb-3">Đăng nhập</Button>
                <div className="login-social">
                  <span>Hoặc tiếp tục với</span>
                  <div className="social-icons">
                    <Button variant="light"><img src="/assets/logo/microsoft.png" alt="Microsoft" /></Button>
                    <Button variant="light"><img src="/assets/logo/google.png" alt="Google" /></Button>
                    <Button variant="light"><img src="/assets/logo/github.png" alt="GitHub" /></Button>
                  </div>
                </div>
                <div className="register-link">
                  Nếu bạn chưa có tài khoản, vui lòng <a href="#">Đăng ký</a>
                </div>
                <div className="terms">
                  Trang này được bảo vệ bởi reCAPTCHA và áp dụng <a href="#">Điều khoản sử dụng</a>.
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
      {/* Add more sections below as needed */}
    </div>
  );
};

export default LandingPage;
