import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "./Pages.css";

const ResetPassword = () => {
  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reset password");

      setMessage(data.message);
      setFormData({ newPassword: "", confirmPassword: "" });

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-card">
            <div className="reset-password-icon">❌</div>
            <h2>Invalid Reset Link</h2>
            <p className="reset-password-subtitle">
              The password reset link is invalid or missing. Please request a
              new password reset link.
            </p>
            <div className="reset-password-links">
              <Link to="/forgot-password" className="reset-password-btn">
                Request New Reset Link
              </Link>
              <Link to="/" className="back-to-login">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-icon">🔑</div>
          <h2>Reset Your Password</h2>
          <p className="reset-password-subtitle">
            Enter your new password below.
          </p>

          {message && (
            <div className="alert alert-success">
              {message}
              <p>Redirecting to home page...</p>
            </div>
          )}
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="New Password"
                required
                minLength={6}
              />
            </div>
            <div className="input-group">
              <span className="input-icon">✅</span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm New Password"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              className="reset-password-btn"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          <div className="reset-password-links">
            <Link to="/" className="back-to-login">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
