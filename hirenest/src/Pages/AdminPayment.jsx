import { useState, useEffect } from "react";
import "./Pages.css";
import { getAuthToken } from "../utils/cookies";

function AdminPayment() {
  const [closedJobs, setClosedJobs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("pending"); // pending, history
  const [processingJobId, setProcessingJobId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([fetchClosedJobs(), fetchTransactions()]);
    setLoading(false);
  };

  const fetchClosedJobs = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/payments/admin/closed-jobs`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClosedJobs(data);
      } else {
        setError("Failed to fetch closed jobs");
      }
    } catch (error) {
      console.error("Error fetching closed jobs:", error);
      setError("Network error. Please try again.");
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE}/payments/admin/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setError("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Network error. Please try again.");
    }
  };

  const handlePay = async (job) => {
    try {
      setProcessingJobId(job._id);
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE}/payments/admin/initialize-payment`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ jobId: job._id }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success && data.paymentUrl) {
        // Redirect to SSLCommerz payment page
        window.location.href = data.paymentUrl;
      } else {
        setError(data.error || "Failed to initialize payment");
        setProcessingJobId(null);
      }
    } catch (error) {
      console.error("Error initializing payment:", error);
      setError("Network error. Please try again.");
      setProcessingJobId(null);
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

  const getBudgetAmount = (budget) => {
    if (!budget) return 0;
    const budgetStr = budget.toString();
    const numbers = budgetStr.match(/\d+/g);
    if (numbers && numbers.length > 0) {
      return parseInt(numbers[0], 10);
    }
    return 0;
  };

  const getPaymentRecipient = (job) => {
    if (job.acceptedApplicant) {
      return {
        type: "jobSeeker",
        name: `${job.acceptedApplicant.firstName} ${job.acceptedApplicant.lastName}`,
        email: job.acceptedApplicant.email,
      };
    }
    return {
      type: "jobProvider",
      name: `${job.postedBy.firstName} ${job.postedBy.lastName}`,
      email: job.postedBy.email,
    };
  };

  return (
    <div className="page-container">
      <h1>Admin Payment Dashboard</h1>
      <p className="intro-text">
        Manage payments for closed jobs. Pay job providers or job seekers based
        on job completion status.
      </p>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "pending" ? "active" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          💰 Pending Payments ({closedJobs.length})
        </button>
        <button
          className={`admin-tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          📊 Transaction History ({transactions.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-message">Loading data...</div>
      ) : (
        <>
          {/* Pending Payments Tab */}
          {activeTab === "pending" && (
            <div className="content-section">
              <h2>Closed Jobs Awaiting Payment</h2>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {closedJobs.length === 0 ? (
                <div className="complaint-card-modern">
                  <p style={{ textAlign: "center", padding: "20px" }}>
                    No closed jobs awaiting payment.
                  </p>
                </div>
              ) : (
                <div className="complaints-list">
                  {closedJobs.map((job) => {
                    const recipient = getPaymentRecipient(job);
                    const budgetAmount = getBudgetAmount(job.budget);
                    return (
                      <div key={job._id} className="complaint-card-modern">
                        <div className="complaint-header-modern">
                          <div className="complaint-icon-modern">💼</div>
                          <div style={{ flex: 1 }}>
                            <h3>{job.title}</h3>
                            <p className="complaint-subtitle">
                              Job ID: {job._id.slice(-6)}
                            </p>
                            <p className="complaint-subtitle">
                              Closed: {formatDate(job.updatedAt)}
                            </p>
                          </div>
                          <div>
                            <span className="status-badge status-pending">
                              Awaiting Payment
                            </span>
                          </div>
                        </div>
                        <div className="complaint-content">
                          <p>
                            <strong>Description:</strong>
                          </p>
                          <p>{job.description}</p>
                        </div>
                        <div className="complaint-meta">
                          <p>
                            <strong>Budget:</strong> ৳{budgetAmount}
                          </p>
                          <p>
                            <strong>Job Field:</strong> {job.jobField}
                          </p>
                          <p>
                            <strong>Payment Recipient:</strong>{" "}
                            {recipient.type === "jobSeeker" ? (
                              <span className="role-badge role-jobSeeker">
                                Job Seeker: {recipient.name} ({recipient.email})
                              </span>
                            ) : (
                              <span className="role-badge role-jobProvider">
                                Job Provider: {recipient.name} (
                                {recipient.email})
                              </span>
                            )}
                          </p>
                          <p>
                            <strong>Reason:</strong>{" "}
                            {recipient.type === "jobSeeker"
                              ? "Job provider accepted a job seeker's request before closing"
                              : "Job provider closed without accepting any job seeker's request"}
                          </p>
                        </div>
                        <div className="complaint-actions">
                          <button
                            className="btn-modern-primary"
                            onClick={() => handlePay(job)}
                            disabled={processingJobId === job._id}
                          >
                            {processingJobId === job._id
                              ? "⏳ Processing..."
                              : `💳 Pay ৳${budgetAmount} via SSLCommerz`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Transaction History Tab */}
          {activeTab === "history" && (
            <div className="content-section">
              <h2>Transaction History</h2>
              {error && <p style={{ color: "red" }}>{error}</p>}
              {transactions.length === 0 ? (
                <div className="complaint-card-modern">
                  <p style={{ textAlign: "center", padding: "20px" }}>
                    No transactions found.
                  </p>
                </div>
              ) : (
                <>
                  {/* Table view - shown on larger screens */}
                  <div className="admin-table-container admin-table-desktop">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Transaction ID</th>
                          <th>Job Title</th>
                          <th>Recipient</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((txn) => (
                          <tr key={txn._id}>
                            <td className="id-cell">
                              {txn.transactionId.slice(-8)}
                            </td>
                            <td>{txn.jobData?.title || "N/A"}</td>
                            <td>
                              {txn.recipientType === "jobSeeker" ? (
                                <span className="role-badge role-jobSeeker">
                                  Job Seeker
                                </span>
                              ) : (
                                <span className="role-badge role-jobProvider">
                                  Job Provider
                                </span>
                              )}
                            </td>
                            <td>৳{txn.amount}</td>
                            <td>
                              <span
                                className={`status-badge ${
                                  txn.status === "completed"
                                    ? "status-resolved"
                                    : txn.status === "pending"
                                      ? "status-pending"
                                      : "status-cancelled"
                                }`}
                              >
                                {txn.status}
                              </span>
                            </td>
                            <td>{formatDate(txn.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Card view - shown on small screens */}
                  <div className="users-card-list">
                    {transactions.map((txn) => (
                      <div key={txn._id} className="user-card">
                        <div className="user-card-header">
                          <span className="user-card-name">
                            {txn.jobData?.title || "N/A"}
                          </span>
                          <span
                            className={`status-badge ${
                              txn.status === "completed"
                                ? "status-resolved"
                                : txn.status === "pending"
                                  ? "status-pending"
                                  : "status-cancelled"
                            }`}
                          >
                            {txn.status}
                          </span>
                        </div>
                        <div className="user-card-info">
                          <span>
                            Transaction: {txn.transactionId.slice(-8)}
                          </span>
                          <span>Amount: ৳{txn.amount}</span>
                          <span>
                            Recipient:{" "}
                            {txn.recipientType === "jobSeeker"
                              ? "Job Seeker"
                              : "Job Provider"}
                          </span>
                          <span>Date: {formatDate(txn.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AdminPayment;
