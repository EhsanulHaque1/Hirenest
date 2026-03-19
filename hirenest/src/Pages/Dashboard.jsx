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

      {user.role === 'jobProvider' ? (
        <div className="content-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>My Posted Jobs</h2>
            <button
              onClick={() => navigate('/post-job')}
              className="btn-modern-primary"
            >
              + Post New Job
            </button>
          </div>

          {myJobs.length === 0 ? (
            <div className="feature-card" style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📋</div>
              <h3 style={{ marginBottom: '8px' }}>No jobs posted yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Start posting jobs to find talented freelancers.</p>
              <button
                onClick={() => navigate('/post-job')}
                className="btn-modern-primary"
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {myJobs.map(job => (
                <div key={job._id} className="feature-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem' }}>{job.title}</h3>
                      <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: '600' }}>Field:</span> {job.jobField} | 
                        <span style={{ fontWeight: '600', marginLeft: '8px' }}>Budget:</span> {job.budget}
                      </p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <span style={{ fontWeight: '600' }}>Status:</span>{' '}
                        <span style={{
                          color: job.status === 'open' ? 'var(--primary-green)' : '#ef4444',
                          fontWeight: '600'
                        }}>
                          {job.status.toUpperCase()}
                        </span>
                        <span style={{ fontWeight: '600', marginLeft: '12px' }}>Applicants:</span> {job.applicants.length}
                      </p>
                    </div>
                    {job.status === 'open' && (
                      <button
                        onClick={() => handleCloseJob(job._id)}
                        className="btn-delete-small"
                      >
                        Close Job
                      </button>
                    )}
                  </div>

                  {job.applicants.length > 0 && (
                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
                      <h4 style={{ margin: '0 0 16px 0' }}>Applicants ({job.applicants.length})</h4>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        {job.applicants.map((applicant, idx) => (
                          <div key={idx} className="feature-card" style={{ padding: '16px', background: 'var(--bg-secondary)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <div>
                                <p style={{ margin: '0 0 4px 0', fontWeight: '600' }}>
                                  {applicant.user?.firstName} {applicant.user?.lastName}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                  Field: {applicant.user?.jobField}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  localStorage.setItem('chat_with', JSON.stringify(applicant.user));
                                  navigate('/chat');
                                }}
                                className="btn-modern-primary"
                                style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                              >
                                💬 Chat
                              </button>
                            </div>
                            {applicant.proposal && (
                              <div style={{ 
                                marginTop: '12px', 
                                padding: '12px', 
                                background: 'var(--bg-primary)', 
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border-light)'
                              }}>
                                <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                  📝 Proposal:
                                </p>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                  {applicant.proposal}
                                </p>
                              </div>
                            )}
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
          <h2>My Applications</h2>
          
          {myApplications.length === 0 ? (
            <div className="feature-card" style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>📨</div>
              <h3 style={{ marginBottom: '8px' }}>No applications yet</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Browse jobs and apply to start working.</p>
              <button
                onClick={() => navigate('/browse-apply')}
                className="btn-modern-primary"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '16px' }}>
              {myApplications.map(job => (
                <div key={job._id} className="feature-card" style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 12px 0', fontSize: '1.25rem' }}>{job.title}</h3>
                      <p style={{ margin: '0 0 8px 0', color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: '600' }}>Field:</span> {job.jobField} | 
                        <span style={{ fontWeight: '600', marginLeft: '8px' }}>Budget:</span> {job.budget}
                      </p>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                        <span style={{ fontWeight: '600' }}>Posted by:</span> {job.postedBy?.firstName} {job.postedBy?.lastName}
                      </p>
                    </div>
                    <span style={{
                      padding: '8px 16px',
                      background: job.status === 'open' ? 'var(--gradient-primary)' : '#fee2e2',
                      color: job.status === 'open' ? 'white' : '#991b1b',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      {job.status.toUpperCase()}
                    </span>
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
