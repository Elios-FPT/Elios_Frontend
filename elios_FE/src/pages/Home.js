// FRONT-END: cv-generate-module/src/pages/Home.js
import React from "react";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Container>
      <Row>
        <Col>
          <h1>CV Generator </h1>
            <p>Welcome to the CV Generator application!</p>
            <p> Generate a CV now</p>
            <Link to="/editor">
              <button>Get Started</button>
            </Link>
        </Col>
      </Row>
    </Container>
  );
};

export default Home;
