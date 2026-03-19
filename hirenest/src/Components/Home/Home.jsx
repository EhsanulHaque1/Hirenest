import { useState, useEffect } from "react";
import Header from "../Header/Header";
import { Link, useNavigate } from "react-router-dom";
import { FaBriefcase, FaSearch, FaCreditCard, FaComments, FaStar, FaRobot } from "react-icons/fa";

const API_BASE = import.meta.env.VITE_API_URL || "/api";

const Home = () => {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from database instead of localStorage
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // For admin token, use hardcoded admin user
      if (token === "admin-token") {
        setUser({
          username: "admin",
          firstName: "Admin",
          role: "admin",
          profileComplete: true
        });
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          localStorage.setItem('hirenest_user', JSON.stringify(userData));
        } else {
          localStorage.removeItem("token");
          localStorage.removeItem("hirenest_user");
          setUser(null);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, []);

  return (
    <>
      <div className="hero-container">
        <Header
          showSignIn={showSignIn}
          setShowSignIn={setShowSignIn}
          showSignUp={showSignUp}
          setShowSignUp={setShowSignUp}
          user={user}
          setUser={setUser}
          loading={loading}
        />

        <div className="hero-content">
          <h1>
            Opportunities Here <br />
            Build & Achieve <br />
            Your Way
          </h1>
          <p>Build your skills, learn new tech, and grow your career.</p>

          <div className="button-group">
            <button className="btn-getStarted" onClick={() => setShowSignUp(true)}>
              Get Started
            </button>
            <Link to="/how-it-works">
              <button className="btn-learnmore">Learn More</button>
            </Link>
          </div>
        </div>
      </div>

      <section className="middle-section">
        <div className="middle-container">
          <div className="section-header">
            <h2>How HireNest Works</h2>
            <p>Discover the power of seamless hiring and freelancing</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><FaBriefcase /></div>
              <h3>Post a Job</h3>
              <p>Create and publish job listings with detailed requirements and budget</p>
              <Link to="/post-job">
                <button className="feature-btn">Learn More</button>
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaSearch /></div>
              <h3>Browse & Apply</h3>
              <p>Find perfect freelancers or discover opportunities that match your skills</p>
              <Link to="/browse-apply">
                <button className="feature-btn">Learn More</button>
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaCreditCard /></div>
              <h3>Secure Payments</h3>
              <p>Escrow-based transactions ensuring safety for both parties</p>
              <Link to="/payments">
                <button className="feature-btn">Learn More</button>
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaComments /></div>
              <h3>Real-time Chat</h3>
              <p>Communicate directly with clients or freelancers in real-time</p>
              <Link to="/chat">
                <button className="feature-btn">Learn More</button>
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaStar /></div>
              <h3>Ratings & Reviews</h3>
              <p>Build trust through transparent reviews and performance ratings</p>
              <Link to="/reviews">
                <button className="feature-btn">Learn More</button>
              </Link>
            </div>

            <div className="feature-card">
              <div className="feature-icon"><FaRobot /></div>
              <h3>AI Assistant</h3>
              <p>Get help with job searches, application tips, and career advice</p>
              <Link to="/ai-assistant">
                <button className="feature-btn">Learn More</button>
              </Link>
            </div>
          </div>

          <div className="cta-section">
            <h3>Ready to Transform Your Career or Hiring?</h3>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => setShowSignUp(true)}>
                I'm a Job Seeker
              </button>
              <button className="btn-secondary" onClick={() => navigate('/find-freelancers')}>
                I'm Hiring
              </button>
            </div>
          </div>
        </div>
      </section>

      
    </>
  );
};

export default Home;