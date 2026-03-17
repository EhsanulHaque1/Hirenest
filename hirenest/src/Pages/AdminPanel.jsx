import { useState, useEffect } from "react";
import "./Pages.css";

function AdminPanel() {
  const [complaint, setComplaint] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [myComplaints, setMyComplaints] = useState([]);
  const [showMyComplaints, setShowMyComplaints] = useState(false);

  useEffect(() => {
    if (showMyComplaints) {
      fetchMyComplaints();
    }
  }, [showMyComplaints]);

  const fetchMyComplaints = async () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("hirenest_user");
    if (!token || !userData) return;

    const currentUser = JSON.parse(userData);
    // Login API returns "id", not "_id"
    const currentUserId = currentUser.id || currentUser._id;
    const currentUsername = currentUser.username;

    try {
      const response = await fetch("/api/complaints/", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const allComplaints = await response.json();
        // Filter complaints to show only current user's complaints
        // Check by id/_id first, then fall back to username
        const myComplaintsList = allComplaints.filter((complaint) => {
          if (complaint.userId) {
            // If userId is populated as an object, check both _id and id
            const complaintUserId = complaint.userId._id || complaint.userId.id;
            if (complaintUserId === currentUserId) {
              return true;
            }
            // Fallback: check by username
            if (complaint.userId.username === currentUsername) {
              return true;
            }
          }
          return false;
        });
        setMyComplaints(myComplaintsList);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    }
  };

  const handleChange = (e) => {
    setComplaint(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/complaints/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ complaintText: complaint }),
      });

      if (response.ok) {
        setSubmitted(true);
        setComplaint("");
        fetchMyComplaints();
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to submit complaint");
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="page-container">
      <h1>Admin Panel</h1>
      <p className="intro-text">
        Submit your complaints or feedback to the admin team.
      </p>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${!showMyComplaints ? "active" : ""}`}
          onClick={() => setShowMyComplaints(false)}
        >
          📝 Submit Complaint
        </button>
        <button
          className={`admin-tab ${showMyComplaints ? "active" : ""}`}
          onClick={() => setShowMyComplaints(true)}
        >
          📋 My Complaints
        </button>
      </div>

      {!showMyComplaints ? (
        <>
          {submitted ? (
            <div className="success-message-modern">
              <div className="success-icon-modern">✓</div>
              <h2>Complaint Submitted Successfully!</h2>
              <p>
                Thank you for your feedback. We will review your complaint and get
                back to you soon.
              </p>
              <button
                className="btn-modern-primary"
                onClick={() => {
                  setSubmitted(false);
                  setError("");
                }}
              >
                Submit Another Complaint
              </button>
            </div>
          ) : (
            <div className="content-section">
              <div className="complaint-card-modern">
                <div className="complaint-header-modern">
                  <div className="complaint-icon-modern">📝</div>
                  <div>
                    <h2>Submit Your Complaint</h2>
                    <p className="complaint-subtitle">
                      We value your feedback and are here to help
                    </p>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="complaint-form-modern">
                  {error && (
                    <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>
                  )}
                  <div className="textarea-wrapper-modern">
                    <textarea
                      value={complaint}
                      onChange={handleChange}
                      placeholder="Describe your issue in detail. Our team will review it promptly..."
                      rows="6"
                      required
                      className="complaint-textarea"
                    />
                    <span className="textarea-char-count">
                      {complaint.length} characters
                    </span>
                  </div>

                  <div className="complaint-actions">
                    <button
                      type="submit"
                      className="btn-modern-primary"
                      disabled={loading}
                    >
                      <span className="btn-icon">✈️</span>
                      {loading ? "Submitting..." : "Submit Complaint"}
                    </button>
                    <button
                      type="button"
                      className="btn-modern-secondary"
                      onClick={() => setComplaint("")}
                      disabled={loading}
                    >
                      Clear
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="content-section">
          <h2>My Complaints</h2>
          {myComplaints.length === 0 ? (
            <div className="complaint-card-modern">
              <p style={{ textAlign: "center", padding: "20px" }}>
                You haven't submitted any complaints yet.
              </p>
            </div>
          ) : (
            <div className="complaints-list">
              {myComplaints.map((complaint) => (
                <div key={complaint._id} className="complaint-card-modern">
                  <div className="complaint-header-modern">
                    <div className="complaint-icon-modern">📝</div>
                    <div style={{ flex: 1 }}>
                      <h3>Complaint #{complaint._id.slice(-6)}</h3>
                      <p className="complaint-subtitle">
                        Submitted: {formatDate(complaint.createdAt)}
                      </p>
                    </div>
                    <div>
                      <span
                        className={`status-badge ${complaint.status === "resolved" ? "status-resolved" : "status-pending"}`}
                      >
                        {complaint.status || "pending"}
                      </span>
                    </div>
                  </div>
                  <div className="complaint-content">
                    <p><strong>Your Complaint:</strong></p>
                    <p>{complaint.complaintText}</p>
                  </div>
                  
                  {complaint.status === "resolved" && complaint.resolutionMessage && (
                    <div className="resolution-message-user">
                      <div className="resolution-header">
                        <span className="resolution-icon">✓</span>
                        <strong>Your Problem is Solved!</strong>
                      </div>
                      <p className="resolution-text">{complaint.resolutionMessage}</p>
                    </div>
                  )}

                  {complaint.status === "pending" && (
                    <div className="pending-message">
                      <p>⏳ Your complaint is being reviewed by our admin team.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="content-section">
        <h2>Contact Information</h2>
        <div className="process-columns">
          <div className="process-card contact-card">
            <div className="process-step">📧</div>
            <p>Email: support@hirenest.com</p>
          </div>
          <div className="process-card contact-card">
            <div className="process-step">📞</div>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
          <div className="process-card contact-card">
            <div className="process-step">⏰</div>
            <p>Response Time: 24-48 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
