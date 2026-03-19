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
      const res = await fetch(`${API_BASE}/jobs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post job');

      setMessage('Job posted successfully! 🎉');
      setMessageType('success');
      setFormData({ title: '', description: '', budget: '', jobField: '' });
      fetchMyJobs();
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
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

      <div className="content-section" style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="complaint-card-modern">
          <div className="complaint-header-modern">
            <div className="complaint-icon-modern">📋</div>
            <div>
              <h2 style={{ margin: 0 }}>Create New Job Post</h2>
              <p className="complaint-subtitle">Fill in the details to find the best talent</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="complaint-form-modern">
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Need a React Developer for E-commerce Site"
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--border-light)',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)',
                  transition: 'all 0.3s ease'
                }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Job Field *
              </label>
              <select
                name="jobField"
                value={formData.jobField}
                onChange={handleChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '2px solid var(--border-light)', 
                  background: 'var(--bg-primary)', 
                  fontSize: '1rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                <option value="">Select job field</option>
                {jobFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Budget *
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., $500 - $1000 or Fixed Price"
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid var(--border-light)',
                  fontSize: '1rem',
                  background: 'var(--bg-secondary)'
                }}
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job requirements, responsibilities, and expected deliverables..."
                rows="5"
                required
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  borderRadius: 'var(--radius-md)', 
                  border: '2px solid var(--border-light)', 
                  fontSize: '1rem', 
                  resize: 'vertical',
                  background: 'var(--bg-secondary)'
                }}
              />
            </div>

            {message && (
              <div className={messageType === 'success' ? 'success-message' : 'error-message'}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-modern-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}
            >
              {loading ? '⏳ Posting Job...' : '✨ Post Job'}
            </button>
          </form>
        </div>
      </div>

      {myJobs.length > 0 && (
        <div className="content-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2>My Posted Jobs ({myJobs.length})</h2>
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
                      }}>{job.status.toUpperCase()}</span>{' '}| 
                      <span style={{ fontWeight: '600', marginLeft: '8px' }}>Applicants:</span> {job.applicants.length}
                    </p>
                  </div>
                  {job.status === 'open' && (
                    <button
                      onClick={() => handleCloseJob(job._id)}
                      className="btn-delete-small"
                      style={{ padding: '10px 20px' }}
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
