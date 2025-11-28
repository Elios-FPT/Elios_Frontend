import React from 'react';
import './Footer.css';

const Footer = () => {
  const handleEmailClick = (e) => {
    e.preventDefault();
    window.location.href = 'mailto:elios.development@gmail.com';
  };

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-left">
          <span className="footer-logo">👨‍💻 Elios</span>
          <span className="footer-text">© 2025 Elios Development. All rights reserved.</span>
        </div>
        
        <div className="footer-right">
          <a 
            href="mailto:elios.development@gmail.com" 
            className="footer-email"
            onClick={handleEmailClick}
            title="Contact Support"
          >
            📧 elios.development@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;