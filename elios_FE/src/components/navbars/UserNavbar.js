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
    // 1. Links Public (Khách và User đều thấy)
    const publicLinks = [
      { to: "/forum", label: t("UserNavbar.forum") },
      { to: "/codingChallenge", label: t("UserNavbar.codingChallenge") },
    ];

    // 2. Links Private (Chỉ User đã đăng nhập mới thấy)
    const userPrivateLinks = [
      { to: "/mock-projects", label: t("UserNavbar.projectChallenge") },
      { to: "/resume-builder", label: t("UserNavbar.buildCV") },
      { to: "/user/profile", label: "Profile" },
      { to: "/interview", label: "Interview" },
    ];

    let linksToShow = [];

    // Logic chia luồng hiển thị
    if (!role) {
      // Trường hợp chưa đăng nhập: Chỉ hiện Public Links
      linksToShow = publicLinks;
    } else if (role === "User") {
      // Trường hợp là User: Hiện Public + Private
      linksToShow = [...publicLinks, ...userPrivateLinks];
    } else {
      // Các role quản lý (Admin, Manager...) - bắt đầu với mảng rỗng (theo logic cũ)
      // hoặc bạn có thể thêm publicLinks vào đây nếu muốn Admin cũng thấy Forum trên navbar
      linksToShow = [];
    }

    // Các role đặc biệt: thêm link quản lý
    if (role === "Resource Manager") {
      linksToShow.push(
        { to: "/manage-coding-bank", label: "Quản lý Ngân hàng Đề Code" },
        { to: "/manage-project-bank", label: "Quản lý Ngân hàng Dự án" },
        { to: "/manage-interviews", label: "Quản lý Phỏng vấn" },
        { to: "/manage-prompts", label: "Quản lý Prompt" }
      );
    }

    if (role === "Content Moderator") {
      linksToShow.push({ to: "/manage-forum", label: "Quản lý Diễn đàn" });
    }

    if (role === "Admin") {
      linksToShow.push(
        { to: "/manage-coding-bank", label: "Quản lý Ngân hàng Đề Code" },
        { to: "/manage-project-bank", label: "Quản lý Ngân hàng Dự án" },
        { to: "/content-moderator", label: "Quản lý Diễn đàn" },
      );
    }

    return linksToShow;
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