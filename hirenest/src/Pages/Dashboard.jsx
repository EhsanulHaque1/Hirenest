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
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/close`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>My Posted Jobs</h2>
            <button
              onClick={() => navigate('/post-job')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              + Post New Job
            </button>
          </div>

          {myJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
              <h3>No jobs posted yet</h3>
              <p>Start posting jobs to find talented freelancers.</p>
              <button
                onClick={() => navigate('/post-job')}
                style={{
                  marginTop: '15px',
                  padding: '12px 24px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Post Your First Job
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myJobs.map(job => (
                <div key={job._id} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0' }}>{job.title}</h3>
                      <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>
                        <strong>Field:</strong> {job.jobField} | <strong>Budget:</strong> {job.budget}
                      </p>
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
                        <strong>Status:</strong> {' '}
                        <span style={{
                          color: job.status === 'open' ? '#10b981' : '#ef4444',
                          fontWeight: '600'
                        }}>
                          {job.status.toUpperCase()}
                        </span>
                        {' '}| <strong>Applicants:</strong> {job.applicants.length}
                      </p>
                    </div>
                    {job.status === 'open' && (
                      <button
                        onClick={() => handleCloseJob(job._id)}
                        style={{
                          padding: '8px 16px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500'
                        }}
                      >
                        Close Job
                      </button>
                    )}
                  </div>

                  {job.applicants.length > 0 && (
                    <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
                      <h4 style={{ margin: '0 0 10px 0' }}>Applicants ({job.applicants.length}):</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {job.applicants.map((applicant, idx) => (
                          <div key={idx} style={{
                            padding: '15px',
                            background: '#f9fafb',
                            borderRadius: '8px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                              <div>
                                <p style={{ margin: '0', fontWeight: '500' }}>
                                  {applicant.user?.firstName} {applicant.user?.lastName}
                                </p>
                                <p style={{ margin: '0', fontSize: '0.85rem', color: '#6b7280' }}>
                                  Field: {applicant.user?.jobField}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  localStorage.setItem('chat_with', JSON.stringify(applicant.user));
                                  navigate('/chat');
                                }}
                                style={{
                                  padding: '6px 12px',
                                  background: '#2563eb',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                              >
                                💬 Chat
                              </button>
                            </div>
                            {applicant.proposal && (
                              <div style={{ 
                                marginTop: '10px', 
                                padding: '10px', 
                                background: 'white', 
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb'
                              }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', fontWeight: '500', color: '#374151' }}>
                                  📝 Proposal:
                                </p>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#6b7280' }}>
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
            <div style={{ textAlign: 'center', padding: '40px', background: '#f9fafb', borderRadius: '12px' }}>
              <h3>No applications yet</h3>
              <p>Browse jobs and apply to start working.</p>
              <button
                onClick={() => navigate('/browse-apply')}
                style={{
                  marginTop: '15px',
                  padding: '12px 24px',
                  background: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myApplications.map(job => (
                <div key={job._id} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0' }}>{job.title}</h3>
                      <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>
                        <strong>Field:</strong> {job.jobField} | <strong>Budget:</strong> {job.budget}
                      </p>
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
                        <strong>Posted by:</strong> {job.postedBy?.firstName} {job.postedBy?.lastName}
                      </p>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      background: job.status === 'open' ? '#d1fae5' : '#fee2e2',
                      color: job.status === 'open' ? '#065f46' : '#991b1b',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500'
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
