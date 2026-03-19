import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const fetchUserAndData = async () => {
      const savedUser = localStorage.getItem('hirenest_user');
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

  const handleCloseJob = async (jobId) => {
    const token = localStorage.getItem('token');
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

  if (!user || loading) {
    return (
      <div className="page-container">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Dashboard</h1>
      <p className="intro-text">
        Welcome back, {user.firstName}! Here's your {user.role === 'jobProvider' ? 'job postings' : 'applications'} overview.
      </p>

      {/* Stats Cards */}
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
                <span className="stat-number">{user.jobField}</span>
                <span className="stat-label">Your Field</span>
              </div>
            </div>
          </>
        )}
      </div>

      {user.role === 'jobProvider' ? (
        <div className="content-section">
          <div className="section-header">
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
                        onClick={() => handleCloseJob(job._id)}
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
                        <h4>Applicants ({job.applicants.length})</h4>
                        <p className="applicants-hint">Click chat to message applicants</p>
                      </div>
                      <div className="applicants-list">
                        {job.applicants.map((applicant, idx) => (
                          <div key={idx} className="applicant-item">
                            <div className="applicant-avatar">
                              {applicant.user?.firstName?.charAt(0)}{applicant.user?.lastName?.charAt(0)}
                            </div>
                            <div className="applicant-details">
                              <p className="applicant-name">
                                {applicant.user?.firstName} {applicant.user?.lastName}
                              </p>
                              <p className="applicant-field">{applicant.user?.jobField}</p>
                            </div>
                            <button
                              onClick={() => {
                                localStorage.setItem('chat_with', JSON.stringify(applicant.user));
                                navigate('/chat');
                              }}
                              className="chat-highlight"
                            >
                              <span className="chat-icon">💬</span>
                              <span>Chat Now</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="content-section">
          <div className="section-header">
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
              {myApplications.map(job => (
                <div key={job._id} className="modern-job-card">
                  <div className="job-card-header">
                    <div className="job-card-badge">
                      {job.status === 'open' ? (
                        <span className="badge-active">● Active</span>
                      ) : (
                        <span className="badge-closed">● Closed</span>
                      )}
                    </div>
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
