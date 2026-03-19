import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "./Header.css";

const Header = ({
  showSignIn,
  setShowSignIn,
  showSignUp,
  setShowSignUp,
  user,
  setUser,
  isHome,
  className,
  loading = false,
}) => {
  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const navigate = useNavigate();

  const [signInData, setSignInData] = useState({ username: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData({ ...signInData, [name]: value });
  };

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData({ ...signUpData, [name]: value });
  };

  const checkProfileComplete = async (userId, token) => {
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.profileComplete;
    } catch {
      return false;
    }
  };

  const submitSignIn = async (e) => {
    e.preventDefault();

    // Admin special case
    if (signInData.username === "admin" && signInData.password === "admin") {
      const adminUser = { username: "admin", firstName: "Admin", role: "admin", profileComplete: true };
      localStorage.setItem("token", "admin-token");
      localStorage.setItem("hirenest_user", JSON.stringify(adminUser));
      setUser(adminUser);
      setShowSignIn(false);
      setSignInData({ username: "", password: "" });
      navigate("/admin-page");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signInData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign in failed");

      const userData = { ...data };
      localStorage.setItem("token", data.token);
      localStorage.setItem("hirenest_user", JSON.stringify(userData));
      setUser(userData);
      setShowSignIn(false);
      setSignInData({ username: "", password: "" });

      // Check profile and redirect
      if (!data.profileComplete) {
        navigate("/create-profile");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const submitSignUp = async (e) => {
    e.preventDefault();

    if (!signUpData.role) {
      alert("Please select Job Seeker or Job Provider!");
      return;
    }
    if (signUpData.password !== signUpData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const payload = {
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        email: signUpData.email,
        username: signUpData.username,
        password: signUpData.password,
        role: signUpData.role,
      };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sign up failed");

      // Register doesn't return token/profileComplete, so direct to verify email notice
      alert(data.message || 'Registration successful. Check email to verify.');
      setShowSignUp(false);
      setSignUpData({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        role: "",
      });
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <>
      {/* Header */}
      <header className={className || (isHome ? "home-header" : "")}>
        <div className="logo">
          <img src={logo} alt="logo" />
        </div>

        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            {user && (
              <li><Link to="/dashboard">Dashboard</Link></li>
            )}
            <li>{loading ? (
              <span style={{ cursor: "default", color: "#6b7280" }}>Explore Jobs</span>
            ) : !user ? (
              <span onClick={() => setShowSignUp(true)} style={{ cursor: "pointer" }}>Explore Jobs</span>
            ) : user.role === "admin" ? (
              <Link to="/admin-jobs">Available Jobs</Link>
            ) : (
              <Link to="/browse-apply">Explore Jobs</Link>
            )}</li>
            <li>{loading ? (
              <span style={{ cursor: "default", color: "#6b7280" }}>Admin Panel</span>
            ) : !user ? (
              <span onClick={() => setShowSignUp(true)} style={{ cursor: "pointer" }}>Admin Panel</span>
            ) : user.role === "admin" ? (
              <Link to="/admin-page">Admin Page</Link>
            ) : (
              <Link to="/admin-panel">Admin Panel</Link>
            )}</li>
            {loading ? (
              <li className="nav-user">Loading...</li>
            ) : user ? (
              <>
                <li className="nav-user">Hi, {user.firstName || user.username}</li>
                <li>
                  <button className="btn-logout" onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("hirenest_user");
                    setUser(null);
                    navigate("/");
                  }}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><button className="btn-signin" onClick={() => setShowSignIn(true)}>Sign In</button></li>
                <li><button className="btn-signup" onClick={() => setShowSignUp(true)}>Sign Up</button></li>
              </>
            )}
          </ul>
        </nav>
      </header>

      {/* Sign In Modal */}
      {showSignIn && (
        <div className="modal-overlay" onClick={() => setShowSignIn(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={(e) => { e.stopPropagation(); setShowSignIn(false); }}>✕</button>
            <div className="modal-icon">🔑</div>
            <h2>Welcome Back</h2>
            <p className="modal-subtitle">Sign in to your account</p>
            <form onSubmit={submitSignIn}>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input name="username" value={signInData.username} onChange={handleSignInChange} placeholder="Username" required />
              </div>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input type="password" name="password" value={signInData.password} onChange={handleSignInChange} placeholder="Password" required />
              </div>
              <button type="submit" className="modal-btn modal-btn--signin">Sign In</button>
            </form>
            <p className="modal-switch">
              Don't have an account? <span onClick={() => { setShowSignIn(false); setShowSignUp(true); }}>Sign Up</span>
            </p>
          </div>
        </div>
      )}

      {/* Sign Up Modal */}
      {showSignUp && (
        <div className="modal-overlay" onClick={() => setShowSignUp(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={(e) => { e.stopPropagation(); setShowSignUp(false); }}>✕</button>
            <div className="modal-icon">🚀</div>
            <h2>Create Account</h2>
            <p className="modal-subtitle">Join us today, it's free</p>
            <form onSubmit={submitSignUp}>
              <div className="input-row">
                <div className="input-group">
                  <span className="input-icon">✏️</span>
                  <input name="firstName" value={signUpData.firstName} onChange={handleSignUpChange} placeholder="First Name" required />
                </div>
                <div className="input-group">
                  <span className="input-icon">✏️</span>
                  <input name="lastName" value={signUpData.lastName} onChange={handleSignUpChange} placeholder="Last Name" required />
                </div>
              </div>
              <div className="input-group">
                <span className="input-icon">📧</span>
                <input type="email" name="email" value={signUpData.email} onChange={handleSignUpChange} placeholder="Email Address" required />
              </div>
              <div className="input-group">
                <span className="input-icon">👤</span>
                <input name="username" value={signUpData.username} onChange={handleSignUpChange} placeholder="Username" required />
              </div>
              <div className="role-selector">
                <button type="button" className={`role-btn ${signUpData.role === "jobSeeker" ? "role-btn--active" : ""}`} onClick={() => setSignUpData({ ...signUpData, role: "jobSeeker" })}>
                  <span className="role-icon">🔍</span>
                  <span className="role-label">Job Seeker</span>
                  <span className="role-desc">Looking for work</span>
                </button>
                <button type="button" className={`role-btn ${signUpData.role === "jobProvider" ? "role-btn--active" : ""}`} onClick={() => setSignUpData({ ...signUpData, role: "jobProvider" })}>
                  <span className="role-icon">🏢</span>
                  <span className="role-label">Job Provider</span>
                  <span className="role-desc">Hiring talent</span>
                </button>
              </div>
              <div className="input-group">
                <span className="input-icon">🔒</span>
                <input type="password" name="password" value={signUpData.password} onChange={handleSignUpChange} placeholder="Password" required />
              </div>
              <div className="input-group">
                <span className="input-icon">✅</span>
                <input type="password" name="confirmPassword" value={signUpData.confirmPassword} onChange={handleSignUpChange} placeholder="Confirm Password" required />
              </div>
              <button type="submit" className="modal-btn modal-btn--signup">Sign Up</button>
            </form>
            <p className="modal-switch">
              Already have an account? <span onClick={() => { setShowSignUp(false); setShowSignIn(true); }}>Sign In</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
