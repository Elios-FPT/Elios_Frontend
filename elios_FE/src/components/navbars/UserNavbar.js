// src/components/navbars/UserNavbar.js
import React from "react"; 
import { Container, Row, Col, Nav, Navbar, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../api/apiConfig";
import "../../styles/UserNavbar.css";
import { useUserProfile } from "../../hooks/useUserProfile"; 

const UserNavbar = () => {
  const navigate = useNavigate();

  // Get user data directly from the Global Auth Context
  const { user } = useUserProfile();
  const role = user?.role; // Safely access the role


  // Define links based on the role from Context
  const getRoleBasedLinks = () => {
    // 1. Public Links (Visible to Guests and Users)
    const publicLinks = [
      { to: "/forum", label: "Diễn đàn" },
      { to: "/codingChallenge", label: "Thử Thách Lập Trình" },
    ];

    // 2. Private User Links (Only for logged-in Users)
    const userPrivateLinks = [
      { to: "/mock-projects", label: "Thử Thách Dự Án" },
      { to: "/resume-builder", label: "Tạo CV" },
      { to: "/user/profile", label: "Profile" },
      { to: "/interview", label: "Phỏng Vấn" },
      { to: "/interview/history", label: "Interview History" },
      { to: "/interview/my-reviews", label: "My Reviews"}
    ];

    let linksToShow = [];

    if (!user) {
      // Guest
      linksToShow = publicLinks;
    } else if (role === "User") {
      // Standard User
      linksToShow = [...publicLinks, ...userPrivateLinks];
    } else {
      // Admins/Managers start empty (or add publicLinks if you want them to see Forum)
      linksToShow = [];
    }

    // Role-specific Management Links
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

  const handleLogout = () => {
    // Explicitly remove the user object
    localStorage.removeItem("user");
    // Clear all local storage to be safe
    localStorage.clear();
    // Redirect to backend logout to kill the cookie
    window.location.href = API_ENDPOINTS.LOGOUT_PATH;
  };

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

          {/* Middle Links */}
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
                    <Dropdown.Item as={Link} to="/settings">
                      Cài đặt
                    </Dropdown.Item>
                    <Dropdown.Item onClick={handleLogout}>
                      Đăng xuất
                    </Dropdown.Item>
                    <Dropdown.Divider />
                  </>
                )}

                <Dropdown.Item onClick={() => navigate("/help")}>
                  Trợ giúp
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/terms")}>
                  Điều khoản dịch vụ
                </Dropdown.Item>

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