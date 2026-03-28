import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [ratingData, setRatingData] = useState({ rating: 5, comment: '' });
  const [ratingJobId, setRatingJobId] = useState(null);
  const [closingJobId, setClosingJobId] = useState(null);

  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const fetchUserAndData = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (!savedToken) {
        navigate('/');
        return;
      }

      if (savedToken === 'admin-token') {
        navigate('/admin-page');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/profile`, {
          headers: { 'Authorization': `Bearer ${savedToken}` }
        });
        
        if (!res.ok) {
          navigate('/');
          return;
        }
        
        const userData = await res.json();
        setUser(userData);
        
        if (!userData.profileComplete) {
          navigate('/create-profile');
          return;
        }
        
        fetchData(savedToken, userData.role);
      } catch (error) {
        console.error('Error fetching user:', error);
        navigate('/');
      }
    };
    
    fetchUserAndData();
  }, [navigate]);

  const fetchData = async (authToken, userRole) => {
    setLoading(true);
    try {
      if (userRole === 'jobProvider') {
        const res = await fetch(`${API_BASE}/jobs/my-posted`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMyJobs(data);
        }
      } else if (userRole === 'jobSeeker') {
        const res = await fetch(`${API_BASE}/jobs/my-applications`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          setMyApplications(data);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseJob = async (job, forceClose = false) => {
    const jobId = job._id;
    const token = localStorage.getItem('token');
    
    if (!forceClose && job.acceptedApplicant) {
      setClosingJobId(jobId);
      setRatingJobId(jobId);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/close`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData(token, user.role);
      }
    } catch (error) {
      console.error('Error closing job:', error);
    }
  };
  
  const confirmCloseWithRating = async (jobId) => {
    const token = localStorage.getItem('token');
    try {
      const closeRes = await fetch(`${API_BASE}/jobs/${jobId}/close`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (closeRes.ok) {
        const rateRes = await fetch(`${API_BASE}/jobs/rate-seeker`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            jobId, 
            rating: ratingData.rating, 
            comment: ratingData.comment 
          })
        });
        
        if (rateRes.ok) {
          alert('Job closed and rating submitted successfully!');
        }
        
        setClosingJobId(null);
        setRatingJobId(null);
        setRatingData({ rating: 5, comment: '' });
        fetchData(token, user.role);
      }
    } catch (error) {
      console.error('Error closing job with rating:', error);
    }
  };
  
  const skipRatingAndClose = async (jobId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/close`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setClosingJobId(null);
        setRatingJobId(null);
        fetchData(token, user.role);
      }
    } catch (error) {
      console.error('Error closing job:', error);
    }
  };

  const handleAcceptApplicant = async (jobId, applicantId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/jobs/accept-applicant`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId, applicantId })
      });
      if (res.ok) {
        fetchData(token, user.role);
      } else {
        const data = await res.json();
        alert(data.error || 'Error accepting applicant');
      }
    } catch (error) {
      console.error('Error accepting applicant:', error);
    }
  };

  const handleRateJobSeeker = async (jobId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/jobs/rate-seeker`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          jobId, 
          rating: ratingData.rating, 
          comment: ratingData.comment 
        })
      });
      if (res.ok) {
        alert('Rating submitted successfully!');
        setRatingJobId(null);
        setRatingData({ rating: 5, comment: '' });
        fetchData(token, user.role);
      } else {
        const data = await res.json();
        alert(data.error || 'Error submitting rating');
      }
    } catch (error) {
      console.error('Error rating job seeker:', error);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job post? This action cannot be undone.')) {
      return;
    }
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Job deleted successfully!');
        fetchData(token, user.role);
      } else {
        const data = await res.json();
        alert(data.error || 'Error deleting job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const toggleExpandJob = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  if (!user || loading) {
    return (
      <div className="page-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="intro-text">
            Welcome back, {user.firstName}! Here's your {user.role === 'jobProvider' ? 'job postings' : 'applications'} overview.
          </p>
        </div>
      </div>

      <div className="dashboard-stats">
        {user.role === 'jobProvider' ? (
          <>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <span className="stat-number">{myJobs.length}</span>
                <span className="stat-label">Posted Jobs</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-number">{myJobs.filter(j => j.status === 'open').length}</span>
                <span className="stat-label">Active Jobs</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <span className="stat-number">{myJobs.reduce((acc, j) => acc + j.applicants.length, 0)}</span>
                <span className="stat-label">Total Applicants</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="stat-icon">📨</div>
              <div className="stat-content">
                <span className="stat-number">{myApplications.length}</span>
                <span className="stat-label">Applications</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-number">{myApplications.filter(j => j.status === 'open').length}</span>
                <span className="stat-label">Active</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <span className="stat-text">
                  {Array.isArray(user.jobField) 
                    ? user.jobField.join(' • ') 
                    : user.jobField}
                </span>
                <span className="stat-label">Your Field</span>
              </div>
            </div>
          </>
        )}
      </div>

      {user.role === 'jobProvider' ? (
        <div className="content-section">
          <div className="section-header section-header-centered-text">
            <h2>My Posted Jobs</h2>
            <button
              onClick={() => navigate('/post-job')}
              className="btn-modern-primary"
            >
              <span>+</span> Post New Job
            </button>
          </div>

          {myJobs.length === 0 ? (
            <div className="modern-empty-state">
              <div className="empty-icon-wrapper">
                <span className="empty-icon">📋</span>
              </div>
              <h3>No jobs posted yet</h3>
              <p>Start posting jobs to find talented freelancers.</p>
              <button
                onClick={() => navigate('/post-job')}
                className="btn-modern-primary"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div className="dashboard-jobs-grid">
              {myJobs.map(job => (
                <div key={job._id} className="modern-job-card">
                  <div className="job-card-header">
                    <div className="job-card-badge">
                      {job.status === 'open' ? (
                        <span className="badge-active">● Active</span>
                      ) : (
                        <span className="badge-closed">● Closed</span>
                      )}
                    </div>
                    {job.status === 'open' && (
                      <button
                        onClick={() => handleCloseJob(job)}
                        className="btn-close-job"
                      >
                        Close Job
                      </button>
                    )}
                  </div>
                  
                  <h3 className="job-card-title">{job.title}</h3>
                  
                  <div className="job-card-details">
                    <div className="detail-item">
                      <span className="detail-label">Field</span>
                      <span className="detail-value">{job.jobField}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Budget</span>
                      <span className="detail-value">{job.budget}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Applicants</span>
                      <span className="detail-value applicants-count">{job.applicants.length}</span>
                    </div>
                  </div>

                  {job.applicants.length > 0 && (
                    <div className="applicants-section">
                      <div className="applicants-header">
                        <h4 
                          onClick={() => toggleExpandJob(job._id)}
                          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          Applicants ({job.applicants.length})
                          <span style={{ fontSize: '12px' }}>
                            {expandedJob === job._id ? '▼' : '▶'}
                          </span>
                        </h4>
                      </div>
                      
                      {expandedJob === job._id && (
                        <div className="applicants-list">
                          {job.applicants.map((applicant, idx) => (
                            <div key={idx} className="applicant-item">
                              <div className="applicant-avatar">
                                {applicant.user?.firstName?.charAt(0)}{applicant.user?.lastName?.charAt(0)}
                              </div>
                              <div className="applicant-details">
                                <p className="applicant-name">
                                  {applicant.user?.firstName} {applicant.user?.lastName}
                                  <span 
                                    className="applicant-username"
                                    onClick={() => navigate(`/profile/${applicant.user?._id}`)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    @{applicant.user?.username}
                                  </span>
                                  {applicant.status === 'accepted' && (
                                    <span className="badge-accepted">✓ Accepted</span>
                                  )}
                                  {applicant.status === 'rejected' && (
                                    <span className="badge-rejected">✗ Rejected</span>
                                  )}
                                </p>
                                <p className="applicant-field">{applicant.user?.jobField}</p>
                                {applicant.proposal && (
                                  <p className="applicant-proposal">{applicant.proposal}</p>
                                )}
                              </div>
                              <div className="applicant-actions">
                                <button
                                  onClick={() => {
                                    localStorage.setItem('chat_with', JSON.stringify(applicant.user));
                                    navigate('/chat');
                                  }}
                                  className="chat-highlight"
                                >
                                  <span className="chat-icon">💬</span>
                                  <span>Chat</span>
                                </button>
                                {job.status === 'open' && !job.acceptedApplicant && applicant.status !== 'accepted' && (
                                  <button
                                    onClick={() => handleAcceptApplicant(job._id, applicant.user._id)}
                                    className="btn-accept"
                                  >
                                    Accept
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {job.status === 'completed' && job.acceptedApplicant && (
                    <div className="rating-section">
                      {ratingJobId === job._id ? (
                        <div className="rating-form">
                          <h4>Rate this Job Seeker</h4>
                          <div className="rating-input-group">
                            <label>Rating:</label>
                            <select 
                              value={ratingData.rating} 
                              onChange={(e) => setRatingData({...ratingData, rating: Number(e.target.value)})}
                            >
                              <option value={5}>5 - Excellent</option>
                              <option value={4}>4 - Very Good</option>
                              <option value={3}>3 - Good</option>
                              <option value={2}>2 - Fair</option>
                              <option value={1}>1 - Poor</option>
                            </select>
                          </div>
                          <div className="comment-input-group">
                            <label>Comment (optional):</label>
                            <textarea
                              value={ratingData.comment}
                              onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                              placeholder="Write a comment about this job seeker..."
                              rows={3}
                            />
                          </div>
                          <div className="rating-actions">
                            <button
                              onClick={() => handleRateJobSeeker(job._id)}
                              className="btn-modern-primary"
                            >
                              Submit Rating
                            </button>
                            <button
                              onClick={() => setRatingJobId(null)}
                              className="btn-modern-secondary"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => setRatingJobId(job._id)}
                            className="btn-rate"
                          >
                            ★ Rate Job Seeker
                          </button>
                          <button
                            onClick={() => handleDeleteJob(job._id)}
                            className="btn-delete-job"
                            style={{
                              padding: '10px 20px',
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: 'var(--radius-md)',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️ Delete Job
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="content-section">
          <div className="section-header section-header-centered">
            <h2>My Applications</h2>
          </div>
          
          {myApplications.length === 0 ? (
            <div className="modern-empty-state">
              <div className="empty-icon-wrapper">
                <span className="empty-icon">📨</span>
              </div>
              <h3>No applications yet</h3>
              <p>Browse jobs and apply to start working.</p>
              <button
                onClick={() => navigate('/browse-apply')}
                className="btn-modern-primary"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="dashboard-jobs-grid">
              {myApplications.map(job => {
                const myApplication = job.applicants?.find(
                  app => app.user && app.user._id && String(app.user._id) === String(user._id)
                );
                const applicationStatus = myApplication?.status;
                
                return (
                  <div key={job._id} className="modern-job-card">
                    <div className="job-card-header">
                      <div className="job-card-badge">
                        {job.status === 'open' ? (
                          <span className="badge-active">● Active</span>
                        ) : job.status === 'completed' ? (
                          <span className="badge-completed">● Completed</span>
                        ) : (
                          <span className="badge-closed">● Closed</span>
                        )}
                      </div>
                      {applicationStatus && (
                        <div className="application-status">
                          {applicationStatus === 'accepted' && (
                            <span className="badge-accepted">✓ Accepted</span>
                          )}
                          {applicationStatus === 'rejected' && (
                            <span className="badge-rejected">✗ Rejected</span>
                          )}
                          {applicationStatus === 'pending' && (
                            <span className="badge-pending">⏳ Pending</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="job-card-title">{job.title}</h3>
                    
                    <div className="job-card-details">
                      <div className="detail-item">
                        <span className="detail-label">Field</span>
                        <span className="detail-value">{job.jobField}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Budget</span>
                        <span className="detail-value">{job.budget}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Posted by</span>
                        <span className="detail-value">{job.postedBy?.firstName} {job.postedBy?.lastName}</span>
                      </div>
                    </div>

                    {applicationStatus === 'accepted' && job.status === 'open' && (
                      <div style={{ marginTop: '16px' }}>
                        <button
                          onClick={() => {
                            localStorage.setItem('chat_with', JSON.stringify(job.postedBy));
                            navigate('/chat');
                          }}
                          className="chat-highlight"
                        >
                          <span className="chat-icon">💬</span>
                          <span>Chat with Job Provider</span>
                        </button>
                      </div>
                    )}

                    {applicationStatus === 'accepted' && (job.status === 'closed' || job.status === 'completed') && (
                      <div className="rating-section" style={{ marginTop: '16px' }}>
                        <p style={{ margin: '0 0 8px 0', color: 'var(--primary-green)', fontWeight: '600' }}>
                          {job.status === 'completed' ? '✓' : '📁'} {job.status === 'completed' ? 'Job Completed!' : 'Job Closed!'} Thanks for working with {job.postedBy?.firstName} {job.postedBy?.lastName}
                        </p>
                        
                        {myApplication?.rated && (
                          <div style={{ marginBottom: '12px', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                            <p style={{ margin: '0 0 6px 0', fontWeight: '600', color: 'var(--text-primary)' }}>
                              Your Rating:
                            </p>
                            <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} style={{ 
                                  color: star <= myApplication.rating ? '#f59e0b' : '#d1d5db',
                                  fontSize: '18px'
                                }}>
                                  ★
                                </span>
                              ))}
                            </div>
                            {myApplication.ratingComment && (
                              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                "{myApplication.ratingComment}"
                              </p>
                            )}
                          </div>
                        )}
                        
                        <button
                          onClick={() => {
                            localStorage.setItem('chat_with', JSON.stringify(job.postedBy));
                            navigate('/chat');
                          }}
                          className="chat-highlight"
                        >
                          <span className="chat-icon">💬</span>
                          <span>Message</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {closingJobId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            padding: '32px',
            borderRadius: 'var(--radius-xl)',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ marginTop: 0, color: 'var(--text-primary)' }}>Close Job & Rate</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              This job has an accepted applicant. Would you like to rate them before closing?
            </p>
            
            <div className="rating-form">
              <div className="rating-input-group">
                <label>Rating:</label>
                <select 
                  value={ratingData.rating} 
                  onChange={(e) => setRatingData({...ratingData, rating: Number(e.target.value)})}
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Good</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>
              <div className="comment-input-group">
                <label>Comment (optional):</label>
                <textarea
                  value={ratingData.comment}
                  onChange={(e) => setRatingData({...ratingData, comment: e.target.value})}
                  placeholder="Write a comment about this job seeker..."
                  rows={3}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
              <button
                onClick={() => confirmCloseWithRating(closingJobId)}
                className="btn-modern-primary"
              >
                Close & Rate
              </button>
              <button
                onClick={() => skipRatingAndClose(closingJobId)}
                className="btn-modern-secondary"
              >
                Skip Rating
              </button>
              <button
                onClick={() => {
                  setClosingJobId(null);
                  setRatingJobId(null);
                }}
                className="btn-modern-secondary"
                style={{ background: 'var(--bg-tertiary)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
