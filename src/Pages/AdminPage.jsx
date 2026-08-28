import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Pages.css";

function AdminPage() {
  const [complaints, setComplaints] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // overview, users, complaints
  const [resolutionMessage, setResolutionMessage] = useState({});
  const [stats, setStats] = useState({
    totalComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchComplaints(), fetchUsers(), fetchStats()]);
    setLoading(false);
  };

  const fetchComplaints = async () => {
    try {
      const response = await fetch("/api/complaints/", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
      } else {
        setError("Failed to fetch complaints");
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
      setError("Network error. Please try again.");
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        setError("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    const message = resolutionMessage[complaintId] || "";
    
    if (newStatus === "resolved" && !message.trim()) {
      alert("Please enter a resolution message before marking as resolved");
      return;
    }

    try {
      const response = await fetch(`/api/complaints/${complaintId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          status: newStatus,
          resolutionMessage: newStatus === "resolved" ? message : undefined
        }),
      });

      if (response.ok) {
        setResolutionMessage({ ...resolutionMessage, [complaintId]: "" });
        fetchComplaints();
        fetchStats();
        alert(`Complaint ${newStatus === "resolved" ? "resolved" : "reopened"} successfully!`);
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchUsers();
        fetchStats();
        alert("User deleted successfully!");
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Network error. Please try again.");
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm("Are you sure you want to delete this complaint? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/complaints/${complaintId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchComplaints();
        fetchStats();
        alert("Complaint deleted successfully!");
      } else {
        alert("Failed to delete complaint");
      }
    } catch (error) {
      console.error("Error deleting complaint:", error);
      alert("Network error. Please try again.");
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
      <h1>Admin Dashboard</h1>
      <p className="intro-text">
        Welcome to the admin dashboard. Manage users, complaints, and monitor system statistics.
      </p>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Users ({users.length})
        </button>
        <button
          className={`admin-tab ${activeTab === "complaints" ? "active" : ""}`}
          onClick={() => setActiveTab("complaints")}
        >
          📝 Complaints ({complaints.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-message">Loading data...</div>
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="content-section">
              <h2>System Statistics</h2>
              <div className="process-columns">
                <div className="process-card contact-card">
                  <div className="process-step">📊</div>
                  <h3>{stats.totalComplaints}</h3>
                  <p>Total Complaints</p>
                </div>
                <div className="process-card contact-card">
                  <div className="process-step">⏳</div>
                  <h3>{stats.pendingComplaints}</h3>
                  <p>Pending Complaints</p>
                </div>
                <div className="process-card contact-card">
                  <div className="process-step">✅</div>
                  <h3>{stats.resolvedComplaints}</h3>
                  <p>Resolved Complaints</p>
                </div>
                <div className="process-card contact-card">
                  <div className="process-step">👥</div>
                  <h3>{stats.totalUsers}</h3>
                  <p>Total Users</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="content-section">
              <h2>All Users</h2>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {users.length === 0 ? (
                <div className="complaint-card-modern">
                  <p style={{ textAlign: "center", padding: "20px" }}>
                    No users found.
                  </p>
                </div>
              ) : (
                <>
                  {/* Table view - shown on larger screens */}
                  <div className="admin-table-container admin-table-desktop">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Verified</th>
                          <th>Created At</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <tr key={user._id}>
                            <td className="id-cell">{user._id.slice(-6)}</td>
                            <td>{user.firstName} {user.lastName}</td>
                            <td><Link to={`/profile/${user._id}`} className="username-link">{user.username}</Link></td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`role-badge role-${user.role}`}>
                                {user.role}
                              </span>
                            </td>
                            <td>
                              <span className={`status-badge ${user.isVerified ? "status-resolved" : "status-pending"}`}>
                                {user.isVerified ? "✓ Yes" : "✗ No"}
                              </span>
                            </td>
                            <td>{formatDate(user.createdAt)}</td>
                            <td>
                              <button
                                className="btn-delete-small"
                                onClick={() => handleDeleteUser(user._id, user.username)}
                                title="Delete User"
                              >
                                🗑️ Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Card view - shown on small screens */}
                  <div className="users-card-list">
                    {users.map((user) => (
                      <div key={user._id} className="user-card">
                        <div className="user-card-header">
                          <span className="user-card-name">{user.firstName} {user.lastName}</span>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role}
                          </span>
                        </div>
                        <div className="user-card-info">
                          <Link to={`/profile/${user._id}`} className="user-card-username">@{user.username}</Link>
                          <span>{user.email}</span>
                          <span>ID: {user._id.slice(-6)}</span>
                          <span className={`status-badge ${user.isVerified ? "status-resolved" : "status-pending"}`}>
                            {user.isVerified ? "✓ Verified" : "✗ Not Verified"}
                          </span>
                        </div>
                        <div className="user-card-actions">
                          <button
                            className="btn-delete-small"
                            onClick={() => handleDeleteUser(user._id, user.username)}
                            title="Delete User"
                          >
                            🗑️ Delete User
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Complaints Tab */}
          {activeTab === "complaints" && (
            <div className="content-section">
              <h2>All Complaints</h2>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {complaints.length === 0 ? (
                <div className="complaint-card-modern">
                  <p style={{ textAlign: "center", padding: "20px" }}>
                    No complaints found.
                  </p>
                </div>
              ) : (
                <div className="complaints-list">
                  {complaints.map((complaint) => (
                    <div key={complaint._id} className="complaint-card-modern">
                      <div className="complaint-header-modern">
                        <div className="complaint-icon-modern">📝</div>
                        <div style={{ flex: 1 }}>
                          <h3>Complaint #{complaint._id.slice(-6)}</h3>
                          <p className="complaint-subtitle">
                            From: {complaint.userId?.username || "Unknown User"} ({complaint.userId?.email || "N/A"})
                          </p>
                          <p className="complaint-subtitle">
                            Date: {formatDate(complaint.createdAt)}
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
                        <p><strong>Complaint:</strong></p>
                        <p>{complaint.complaintText}</p>
                      </div>
                      
                      {complaint.resolutionMessage && (
                        <div className="resolution-message">
                          <p><strong>✓ Resolution Message:</strong></p>
                          <p>{complaint.resolutionMessage}</p>
                        </div>
                      )}

                      <div className="complaint-meta">
                        <p><strong>User ID:</strong> {complaint.userId?._id || "N/A"}</p>
                        <p><strong>Complaint ID:</strong> {complaint._id}</p>
                      </div>

                      {complaint.status !== "resolved" && (
                        <div className="resolution-input-container">
                          <textarea
                            className="resolution-textarea"
                            placeholder="Enter resolution message for the user..."
                            value={resolutionMessage[complaint._id] || ""}
                            onChange={(e) => setResolutionMessage({
                              ...resolutionMessage,
                              [complaint._id]: e.target.value
                            })}
                            rows="3"
                          />
                        </div>
                      )}

                      <div className="complaint-actions">
                        {complaint.status !== "resolved" && (
                          <button
                            className="btn-modern-primary"
                            onClick={() =>
                              handleStatusChange(complaint._id, "resolved")
                            }
                          >
                            ✓ Mark as Resolved
                          </button>
                        )}
                        {complaint.status === "resolved" && (
                          <button
                            className="btn-modern-secondary"
                            onClick={() =>
                              handleStatusChange(complaint._id, "pending")
                            }
                          >
                            ↻ Reopen
                          </button>
                        )}
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteComplaint(complaint._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPage;
