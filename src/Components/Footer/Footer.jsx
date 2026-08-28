import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Left - Logo & About */}
        <div className="footer-section">
          <h2 className="logo">Hirenest</h2>
          <p>Hirenest connects clients with talented freelancers worldwide.</p>

          <div className="social-icons">
            <FaFacebook />
            <FaInstagram />
            <FaWhatsapp />
          </div>
        </div>

        {/* Categories */}
        <div className="footer-section">
          <h3>Categories</h3>
          <ul>
            <li>
              <Link to="/web-development">Web Development</Link>
            </li>
            <li>
              <Link to="/app-development">App Development</Link>
            </li>
            <li>
              <Link to="/ui-ux-design">UI/UX Design</Link>
            </li>
            <li>
              <Link to="/marketing">Marketing</Link>
            </li>
          </ul>
        </div>

        {/* Client */}
        <div className="footer-section">
          <h3>Clients</h3>
          <ul>
            <li>
              <Link to="/post-project">Post a Project</Link>
            </li>
            <li>
              <Link to="/find-freelancers">Find Freelancers</Link>
            </li>
            <li>
              <Link to="/how-it-works">How it Works</Link>
            </li>
          </ul>
        </div>

        {/* Freelancers */}
        <div className="footer-section">
          <h3>Freelancers</h3>
          <ul>
            <li>
              <Link to="/create-profile">Create Profile</Link>
            </li>
            <li>
              <Link to="/find-jobs">Find Jobs</Link>
            </li>
            <li>
              <Link to="/support">Support</Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>© 2026 Hirenest. All Rights Reserved.</p>
        <div className="footer-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <Link to="/terms-of-service">Terms of Service</Link>
          <Link to="/help">Help</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
