// src/general/UserNavbar.js
import React, { useEffect } from "react";
import { Navbar, Nav, Dropdown, Container, Badge, Spinner } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_ENDPOINTS } from "../../api/apiConfig";
import { useUserProfile } from "../../hooks/useUserProfile"; // ← quan trọng
import "../../styles/UserNavbar.css";

const UserNavbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  // Lấy user trực tiếp từ hook → luôn chính xác và tự động re-render khi login/logout
  const { user, loading: profileLoading } = useUserProfile();

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "vi" : "en");
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    window.location.href = API_ENDPOINTS.LOGOUT_PATH;
  };

  // Xây dựng nav links dựa trên user.role (từ API, không từ localStorage)
  const getNavLinks = () => {
    const publicLinks = [
      { to: "/forum", label: t("UserNavbar.forum") },
      { to: "/codingChallenge", label: t("UserNavbar.codingChallenge") },
    ];

    // Nếu đang loading hoặc chưa có user → chỉ hiện public
    if (profileLoading || !user) {
      return publicLinks;
    }

    const userPrivateLinks = [
      { to: "/resume-builder", label: t("UserNavbar.buildCV") },
      { to: "/mock-projects", label: t("UserNavbar.projectChallenge") },
      { to: "/interview", label: "Interview" },
      { to: "/interview/history", label: "Interview History" },
      { to: "/interview/my-reviews", label: "My Reviews"}
    ];

    // Role-based links
    if (user.role === "Admin") {
      return [
        ...publicLinks,
        ...userPrivateLinks,
        ...[
          { to: "/manage-coding-bank", label: "Coding Bank" },
          { to: "/manage-project-bank", label: "Project Bank" },
          { to: "/manage-forum", label: "Forum" },
          { to: "/manage-interviews", label: "Interviews" },
          { to: "/manage-prompts", label: "Prompts" },
          { to: "/admin-dashboard", label: "Dashboard", badge: "Admin" },
        ],
      ];
    }

    if (user.role === "Resource Manager") {
      return [
        ...publicLinks,
        ...userPrivateLinks,
        { to: "/manage-coding-bank", label: "Coding Bank" },
        { to: "/manage-project-bank", label: "Project Bank" },
        { to: "/manage-interviews", label: "Interviews" },
        { to: "/manage-prompts", label: "Prompts" },
      ];
    }

    if (user.role === "Content Moderator") {
      return [
        ...publicLinks,
        ...userPrivateLinks,
        { to: "/manage-forum", label: "Manage Forum" },
      ];
    }

    // User thường hoặc role không xác định
    return [...publicLinks, ...userPrivateLinks];
  };

  const navLinks = getNavLinks();
  const isLoggedIn = !!user && !profileLoading;

  // Scroll effect (giữ nguyên)
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.user-navbar-modern');
      if (navbar) {
        window.scrollY > 50 ? navbar.classList.add('scrolled') : navbar.classList.remove('scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Navbar
      expand="lg"
      className="user-navbar-modern shadow-sm"
      style={{ position: 'sticky', top: 0, zIndex: 1050 }}
    >
      <Container fluid className="px-4">
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
                className={`nav-link-modern ${location.pathname === link.to ? "active" : ""}`}
              >
                {link.label}
                {link.badge && <Badge bg="danger" className="ms-2" pill>{link.badge}</Badge>}
              </Nav.Link>
            ))}
          </Nav>

          <Nav className="align-items-center gap-3">
            {/* Language */}
            <Nav.Link onClick={toggleLanguage} className="text-muted">
              <i className="bi bi-globe me-1"></i>
              {i18n.language === "vi" ? "EN" : "VI"}
            </Nav.Link>

            {/* Loading state */}
            {profileLoading && (
              <Spinner animation="border" size="sm" variant="secondary" />
            )}

            {/* Chưa đăng nhập */}
            {!isLoggedIn && !profileLoading && (
              <Nav.Link
                onClick={() => (window.location.href = API_ENDPOINTS.LOGIN_PATH)}
                className="btn-login-outline"
              >
                {t("UserNavbar.login")}
              </Nav.Link>
            )}

            {/* Đã đăng nhập */}
            {isLoggedIn && (
              <Dropdown align="end" className="user-dropdown-modern">
                <Dropdown.Toggle
                  variant="link"
                  bsPrefix="p-0"
                  className="text-decoration-none d-flex align-items-center gap-2 user-toggle-btn"
                >
                  <span className="user-name d-none d-lg-block fw-medium">
                    {user?.name || "Settings"}
                  </span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="dropdown-menu-modern shadow-lg mt-2">
                  <Dropdown.Item as={Link} to="/user/profile">
                    <i className="bi bi-person me-2"></i> {t("UserNavbar.profile")}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i> {t("UserNavbar.logout")}
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item disabled className="text-secondary small">
                    Role: <strong>{user.role || "User"}</strong>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserNavbar;