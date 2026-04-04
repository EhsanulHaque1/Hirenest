import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Pages.css";
import { getAuthUser, getAuthToken } from "../utils/cookies";

function AdminJobs() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedField, setSelectedField] = useState("All");
  const [loading, setLoading] = useState(true);
  const [deletingJob, setDeletingJob] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [deleteType, setDeleteType] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  const jobFields = [
    "All",
    "Web Development",
    "App Development",
    "UI/UX Design",
    "Marketing",
  ];

  useEffect(() => {
    const savedUser = getAuthUser();
    if (savedUser) {
      setUser(savedUser);

      // Only admins can access this page
      if (savedUser.role !== "admin") {
        navigate("/");
      }
    } else {
      navigate("/");
    }

    fetchJobs();
  }, [navigate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Fetch all jobs including closed ones for admin
      const token = getAuthToken();
      const res = await fetch(`${API_BASE}/jobs?includeAll=true`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setJobs(data);
        setFilteredJobs(data);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldFilter = (field) => {
    setSelectedField(field);
    if (field === "All") {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter((job) => job.jobField === field));
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone.",
      )
    ) {
      return;
    }

    setDeletingJob(jobId);
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setDeleteMessage("Job deleted successfully!");
      setDeleteType("success");

      // Remove job from local state
      setJobs(jobs.filter((job) => job._id !== jobId));
      setFilteredJobs(filteredJobs.filter((job) => job._id !== jobId));
    } catch (error) {
      setDeleteMessage(error.message);
      setDeleteType("error");
    } finally {
      setDeletingJob(null);
      setTimeout(() => {
        setDeleteMessage("");
        setDeleteType("");
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner"></div>
        <p style={{ marginTop: "20px", color: "var(--text-secondary)" }}>
          Loading jobs...
        </p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Available Jobs</h1>
      <p className="intro-text">
        Manage all posted jobs - You can delete any job from here
      </p>

      {deleteMessage && (
        <div
          style={{
            padding: "15px 20px",
            borderRadius: "10px",
            marginBottom: "25px",
            fontWeight: "500",
            background:
              deleteType === "success" ? "var(--bg-primary)" : "#fee2e2",
            color:
              deleteType === "success" ? "var(--primary-green)" : "#dc2626",
            border: `1px solid ${deleteType === "success" ? "var(--primary-green)" : "#dc2626"}`,
            maxWidth: "600px",
          }}
        >
          {deleteMessage}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "20px",
          marginBottom: "40px",
          width: "100%",
          maxWidth: "900px",
        }}
        className="jobs-stats-grid"
      >
        <div
          className="filter-card"
          style={{ textAlign: "center", padding: "25px" }}
        >
          <span
            style={{
              display: "block",
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "var(--primary-green)",
            }}
          >
            {jobs.length}
          </span>
          <span style={{ color: "var(--text-secondary)" }}>Total Jobs</span>
        </div>
        <div
          className="filter-card"
          style={{ textAlign: "center", padding: "25px" }}
        >
          <span
            style={{
              display: "block",
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "var(--primary-green)",
            }}
          >
            {jobs.filter((j) => j.status === "open").length}
          </span>
          <span style={{ color: "var(--text-secondary)" }}>Open Jobs</span>
        </div>
        <div
          className="filter-card"
          style={{ textAlign: "center", padding: "25px" }}
        >
          <span
            style={{
              display: "block",
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "#dc2626",
            }}
          >
            {jobs.filter((j) => j.status === "closed").length}
          </span>
          <span style={{ color: "var(--text-secondary)" }}>Closed Jobs</span>
        </div>
      </div>

      <div
        className="content-section"
        style={{ maxWidth: "1000px", width: "100%" }}
      >
        <h2 style={{ marginBottom: "24px", fontSize: "1.5rem" }}>
          Filter by Category
        </h2>
        <div
          className="filters-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          }}
        >
          {jobFields.map((field) => (
            <button
              key={field}
              className={`btn-modern-secondary ${selectedField === field ? "active" : ""}`}
              onClick={() => handleFieldFilter(field)}
              style={{
                padding: "12px 20px",
                background:
                  selectedField === field
                    ? "var(--gradient-primary)"
                    : "var(--bg-tertiary)",
                color:
                  selectedField === field ? "white" : "var(--text-primary)",
                border: "none",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                fontWeight: "500",
                transition: "all 0.3s ease",
              }}
            >
              {field}
            </button>
          ))}
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        <div style={{ padding: "60px 20px", color: "var(--text-secondary)" }}>
          <p>No jobs found in this category.</p>
        </div>
      ) : (
        <div
          className="developers-list"
          style={{ width: "100%", maxWidth: "1200px" }}
        >
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              className="developer-card"
              style={{
                textAlign: "left",
                borderLeft:
                  job.status === "closed"
                    ? "4px solid #dc2626"
                    : "4px solid var(--primary-green)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "15px",
                }}
              >
                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    background: job.status === "open" ? "#d1fae5" : "#fee2e2",
                    color: job.status === "open" ? "#065f46" : "#dc2626",
                  }}
                >
                  {job.status === "open" ? "Open" : "Closed"}
                </span>
                <span
                  style={{
                    background: "var(--bg-tertiary)",
                    color: "var(--primary-green)",
                    padding: "5px 12px",
                    borderRadius: "20px",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                  }}
                >
                  {job.jobField}
                </span>
              </div>

              <h3
                style={{
                  fontSize: "1.3rem",
                  marginBottom: "12px",
                  color: "var(--text-primary)",
                }}
              >
                {job.title}
              </h3>
              <p
                style={{
                  color: "var(--text-secondary)",
                  marginBottom: "20px",
                  lineHeight: "1.6",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {job.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                  marginBottom: "20px",
                  padding: "15px",
                  background: "var(--bg-secondary)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    Budget
                  </span>
                  <span
                    style={{ fontWeight: "600", color: "var(--text-primary)" }}
                  >
                    ${job.budget}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    Posted by
                  </span>
                  <span
                    style={{ fontWeight: "600", color: "var(--text-primary)" }}
                  >
                    {job.postedBy?.username || "Unknown"}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    Posted Date
                  </span>
                  <span
                    style={{ fontWeight: "600", color: "var(--text-primary)" }}
                  >
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      display: "block",
                    }}
                  >
                    Applicants
                  </span>
                  <span
                    style={{ fontWeight: "600", color: "var(--text-primary)" }}
                  >
                    {job.applicants?.length || 0}
                  </span>
                </div>
              </div>

              <button
                className="btn-delete"
                onClick={() => handleDeleteJob(job._id)}
                disabled={deletingJob === job._id}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {deletingJob === job._id ? "Deleting..." : "Delete Job"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminJobs;
