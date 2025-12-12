// src/general/UserNavbar.js
import React, { useEffect, useState } from "react";
import { Navbar, Nav, Dropdown, Container, Badge } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../../styles/UserNavbar.css";

const UserNavbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    setRole(savedRole);
  }, [location]); // Re-check khi route thay đổi (đăng nhập thành công)

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "vi" : "en");
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    // 1. Links Public (Khách và User đều thấy)
    const publicLinks = [
  };
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
    ];

    const resourceManagerLinks = [
      linksToShow.push({ to: "/manage-forum", label: "Quản lý Diễn đàn" });
      { to: "/manage-project-bank", label: "Project Bank" },
      { to: "/manage-interviews", label: "Interviews" },
      { to: "/manage-prompts", label: "Prompts" },
    ];

    const moderatorLinks = [
      linksToShow.push(
        { to: "/manage-coding-bank", label: "Quản lý Ngân hàng Đề Code" },
        { to: "/manage-project-bank", label: "Quản lý Ngân hàng Dự án" },
        { to: "/content-moderator", label: "Quản lý Diễn đàn" },

    return linksToShow;
    if (role === "Resource Manager") return [...baseLinks, ...resourceManagerLinks];
    if (role === "Content Moderator") return [...baseLinks, ...moderatorLinks];
    return baseLinks; // User thường
  };

  const navLinks = getNavLinks();
  const isLoggedIn = !!role;

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.user-navbar-modern');
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Navbar expand="lg" className="user-navbar-modern shadow-sm" fixed="top">
      <Container fluid className="px-4">
        {/* Logo */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img
            src="/assets/logo/logo1.png"
            alt="Logo"
            height="40"
            className="d-inline-block align-top me-2"
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          <Nav className="mx-auto align-items-center gap-1">
            {navLinks.map((link, idx) => (
              <Nav.Link
                key={idx}
                as={Link}
                to={link.to}
                className={`nav-link-modern ${location.pathname === link.to ? "active" : ""
                  }`}
              >
                {link.label}
                {link.badge && (
                  <Badge bg="danger" className="ms-2" pill>
                    {link.badge}
                  </Badge>
                )}
              </Nav.Link>
            ))}
          </Nav>

          {/* Right Side */}
          <Nav className="align-items-center gap-3">
            {/* Language Switcher */}
            <Nav.Link onClick={toggleLanguage} className="text-muted">
              <i className="bi bi-globe me-1"></i>
              {i18n.language === "vi" ? "EN" : "VI"}
            </Nav.Link>

            {/* Nếu chưa đăng nhập */}
            {!isLoggedIn ? (
              <>
                <Nav.Link
                  onClick={() => (window.location.href = API_ENDPOINTS.LOGIN_PATH)}
                  className="btn-login-outline"
                >
                  {t("UserNavbar.login")}
                </Nav.Link>
                <Nav.Link as={Link} to="/register" className="btn-register">
                  {t("UserNavbar.register")}
                </Nav.Link>
              </>
            ) : (
              <>
                {/* Avatar Dropdown */}
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    className="text-decoration-none p-0"
                    id="user-dropdown"
                  >
                    <div className="user-avatar-dropdown d-flex align-items-center gap-2">
                      <div className="avatar-circle bg-primary text-white">
                        {role?.[0] || "U"}
                      </div>
                      <span className="d-none d-lg-inline fw-medium text-dark">
                        {role}
                      </span>
                    </div>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dropdown-menu-modern shadow-lg">
                    <Dropdown.Item as={Link} to="/user/profile">
                      <i className="bi bi-person me-2"></i> {t("UserNavbar.profile")}
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/settings">
                      <i className="bi bi-gear me-2"></i> {t("UserNavbar.settings")}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout} className="text-danger">
                      <i className="bi bi-box-arrow-right me-2"></i>{" "}
                      {t("UserNavbar.logout")}
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item disabled className="text-muted small">
                      Role: <strong>{role}</strong>
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserNavbar;