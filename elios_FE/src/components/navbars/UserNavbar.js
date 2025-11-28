// src/general/UserNavbar.js
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Nav, Navbar, Dropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../../styles/UserNavbar.css";

const UserNavbar = () => {
  const { t, i18n } = useTranslation();
  const [role, setRole] = useState(null);

  // Đọc role từ localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole');
    setRole(savedRole);
  }, []);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "vi" : "en");
  };

  // Xác định các link theo role
  const getRoleBasedLinks = () => {
    const isUser = !role || role === "User";

    // Chỉ User mới thấy các link cơ bản
    const baseLinks = isUser
      ? [
        { to: "/forum", label: t("UserNavbar.forum") },
        { to: "/codingChallenge", label: t("UserNavbar.codingChallenge") },
        { to: "/resume-builder", label: t("UserNavbar.buildCV") },
        { to: "/mock-projects", label: t("UserNavbar.projectChallenge") },
        { to: "/user/profile", label: "Profile" },
        { to: "/interview", label: "Interview" },
      ]
      : [];

    // Các role đặc biệt: thêm link quản lý
    const extraLinks = [];

    if (role === "Resource Manager") {
      extraLinks.push(
        { to: "/manage-coding-bank", label: "Manage Coding Bank" },
        { to: "/manage-project-bank", label: "Manage Project Bank" },
        { to: "/manage-interviews", label: "Manage Interviews" },
        { to: "/manage-prompts", label: "Manage Prompts" }

      );
    }

    if (role === "Content Moderator") {
      extraLinks.push({ to: "/manage-forum", label: "Manage Forum" });
    }

    if (role === "Admin") {
      extraLinks.push(
        { to: "/manage-coding-bank", label: "Manage Coding Bank" },
        { to: "/manage-project-bank", label: "Manage Project Bank" },
        { to: "/manage-forum", label: "Manage Forum" },
        { to: "/admin-dashboard", label: "Admin Dashboard" }
      );
    }

    return [...baseLinks, ...extraLinks];
  };

  const links = getRoleBasedLinks();

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

          {/* Middle Links - Chỉ hiển thị nếu có link */}
          {links.length > 0 && (
            <Col>
              <Nav className="user-navbar-navbar-links">
                {links.map((link, idx) => (
                  <Nav.Link key={idx} as={Link} to={link.to}>
                    {link.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Col>
          )}

          {/* Right side actions */}
          <Col xs="auto" className="user-navbar-navbar-actions">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-light" size="sm" id="dropdown-basic">
                Menu
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {/* Ẩn Login/Register nếu đã có role */}
                {!role ? (
                  <>
                    <Dropdown.Item as={Link} to={API_ENDPOINTS.LOGIN_PATH}>
                      {t("UserNavbar.login")}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/register">
                      {t("UserNavbar.register")}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                  </>
                ) : (
                  <>
                    <Dropdown.Item as={Link} to="/user/profile">
                      {t("UserNavbar.profile")}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/settings">
                      {t("UserNavbar.settings")}
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        localStorage.removeItem('userId');
                        localStorage.removeItem('userRole');
                        window.location.href = API_ENDPOINTS.LOGOUT_PATH;
                      }}
                    >
                      {t("UserNavbar.logout")}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                  </>
                )}

                <Dropdown.Item onClick={toggleLanguage}>
                  {t("UserNavbar.switch_language")}
                </Dropdown.Item>

                {/* Debug: Hiển thị role */}
                {role && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item disabled>Role: {role}</Dropdown.Item>
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