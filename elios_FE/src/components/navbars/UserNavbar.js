// src/components/navbars/UserNavbar.js
import React from "react";
import { Container, Row, Col, Nav, Navbar, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../../styles/UserNavbar.css";
import { useUserProfile } from "../../hooks/useUserProfile";

const UserNavbar = () => {
  const navigate = useNavigate();

  const { user } = useUserProfile();
  const role = user?.role;

  const getRoleBasedLinks = () => {
    const publicLinks = [
      { to: "/forum", label: "Diễn đàn" },
      { to: "/codingChallenge", label: "Thử Thách Lập Trình" },
    ];

    const userPrivateLinks = [
      { to: "/interview", label: "Phỏng Vấn" },
      { to: "/interview/history", label: "Lịch sử phỏng vấn" },
      { to: "/resume-builder", label: "Tạo CV" },
      { to: "/mock-projects", label: "Dự Án Thực Hành" },
      { to: "/user/profile", label: "Hồ Sơ" }
    ];

    let linksToShow = [];

    if (!user) {
      linksToShow = publicLinks;
    } else if (role === "User") {
      linksToShow = [...publicLinks, ...userPrivateLinks];
    } else {
      linksToShow = [];
    }

    if (role === "Resource Manager") {
      linksToShow.push(
        { to: "/manage-coding-bank", label: "Quản lý Ngân hàng Đề Code" },
        { to: "/manage-project-bank", label: "Quản lý Ngân hàng Dự án" },
        { to: "/manage-interviews", label: "Quản lý Phỏng vấn" },
        { to: "/user/profile", label: "Hồ Sơ" }
      );
    }

    if (role === "Content Moderator") {
      linksToShow.push({ to: "/manage-forum", label: "Quản lý Diễn đàn" });
    }

    if (role === "Admin") {
      linksToShow.push(
        { to: "/manage-coding-bank", label: "Quản Lý Code" },
        { to: "/content-moderator", label: "Quản Lý Diễn Đàn" },
        { to: "/manage-prompts", label: "Q.Lý Prompt" },
        { to: "/user/profile", label: "Hồ Sơ" },
        { 
          external: true,
          href: "http://auth.elios.com/admin/elios/console",
          label: "Q.Lý người dùng",
          target: "_blank"
        }
      );
    }

    return linksToShow;
  };

  const links = getRoleBasedLinks();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.clear();
    window.location.href = API_ENDPOINTS.LOGOUT_PATH;
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
          </Col>

          {links.length > 0 && (
            <Col>
              <Nav className="user-navbar-navbar-links">
                {links.map((link, idx) => (
                  <Nav.Link
                    key={idx}
                    as={link.external ? "a" : Link}
                    to={link.external ? undefined : link.to}
                    href={link.external ? link.href : undefined}
                    target={link.external ? link.target : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Col>
          )}

          <Col xs="auto" className="user-navbar-navbar-actions">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" size="sm" id="dropdown-basic">
                Menu
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {!user ? (
                  <>
                    <Dropdown.Item as={Link} to={API_ENDPOINTS.LOGIN_PATH}>
                      Đăng nhập
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/register">
                      Đăng ký
                    </Dropdown.Item>
                    <Dropdown.Divider />
                  </>
                ) : (
                  <>
                    <Dropdown.Item as={Link} to="/user/profile">
                      Hồ sơ
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>
                      Đăng xuất
                    </Dropdown.Item>
                    <Dropdown.Divider />
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
      </Container>
    </nav>
  );
};

export default UserNavbar;