import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

function PostJob() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    jobField: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [myJobs, setMyJobs] = useState([]);

  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem('token');

  const jobFields = ['Web Development', 'App Development', 'UI/UX Design', 'Marketing'];

  useEffect(() => {
    const savedUser = localStorage.getItem('hirenest_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      if (!parsedUser.profileComplete) {
        navigate('/create-profile');
      }
      
      if (parsedUser.role !== 'jobProvider') {
        navigate('/');
      }
    }
    if (!token) navigate('/');
    
    fetchMyJobs();
  }, [navigate, token]);

  const fetchMyJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs/my-posted`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyJobs(data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (!formData.title || !formData.description || !formData.budget || !formData.jobField) {
      setMessage('All fields are required');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      // Initialize payment with SSLCommerz
      const res = await fetch(`${API_BASE}/payments/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobData: formData })
      });

      const data = await res.json();
      console.log('Payment initialization response:', data);
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.failedreason || 'Failed to initialize payment');
      }

      // Redirect to SSLCommerz payment page
      console.log('Redirecting to:', data.paymentUrl);
      setMessage('Redirecting to payment gateway...');
      setMessageType('success');
      window.location.href = data.paymentUrl;
    } catch (error) {
      console.error('Payment error:', error);
      setMessage(error.message);
      setMessageType('error');
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
        fetchMyJobs();
      }
    } catch (error) {
      console.error('Error closing job:', error);
    }
  };

  if (!user) return <div className="page-container"><h1>Loading...</h1></div>;

  return (
    <div className="page-container">
      <h1>Post a New Job</h1>
      <p className="intro-text">
        Find the perfect talent for your project. Define your requirements 
        and receive proposals from qualified professionals.
      </p>

      <div className="content-section post-job-form-container">
        <div className="post-job-card">
          <div className="post-job-header">
            <div className="post-job-icon">📋</div>
            <div>
              <h2 className="post-job-title">Create New Job Post</h2>
              <p className="post-job-subtitle">Fill in the details to find the best talent</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="post-job-form">
            <div className="post-job-input-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Need a React Developer for E-commerce Site"
                required
              />
            </div>

            <div className="post-job-input-group">
              <label>Job Field *</label>
              <select
                name="jobField"
                value={formData.jobField}
                onChange={handleChange}
                required
              >
                <option value="">Select job field</option>
                {jobFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            <div className="post-job-input-group">
              <label>Budget *</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., $500 - $1000 or Fixed Price"
                required
              />
            </div>

            <div className="post-job-input-group">
              <label>Job Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job requirements, responsibilities, and expected deliverables..."
                rows="5"
                required
              />
            </div>

            <div style={{
              background: 'var(--bg-secondary)',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Job Posting Fee:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-green)' }}>
                  ৳100 BDT
                </span>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Payment will be processed securely via SSLCommerz
              </p>
            </div>

            {message && (
              <div className={messageType === 'success' ? 'success-message' : 'error-message'}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-modern-primary post-job-submit-btn"
            >
              {loading ? '⏳ Redirecting to Payment...' : '💳 Pay ৳100 & Post Job'}
            </button>
          </form>
        </div>
      </div>

      {myJobs.length > 0 && (
        <div className="content-section post-job-listed-section">
          <h2>My Posted Jobs ({myJobs.length})</h2>
          <div className="post-job-listed-grid">
            {myJobs.map(job => (
              <div key={job._id} className="dashboard-job-card">
                <div className="dashboard-job-header">
                  <div className="dashboard-job-info">
                    <h3 className="dashboard-job-title">{job.title}</h3>
                    <p className="dashboard-job-meta">
                      <span>Field:</span> {job.jobField} | 
                      <span>Budget:</span> {job.budget}
                    </p>
                    <p className="dashboard-job-meta">
                      <span>Status:</span>{' '}
                      <span style={{
                        color: job.status === 'open' ? 'var(--primary-green)' : '#ef4444',
                        fontWeight: '600'
                      }}>{job.status.toUpperCase()}</span>{' '}| 
                      <span>Applicants:</span> {job.applicants.length}
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
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PostJob;
