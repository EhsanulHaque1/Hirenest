import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./PostJob.css";

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
    <div className="pj-master-wrapper">
      <section className="pj-hero">
        <div className="pj-hero-inner">
          <h1>Post a New Job</h1>
          <p>
            Find the perfect talent for your project. Define your requirements 
            and receive proposals from qualified professionals.
          </p>
        </div>
      </section>

      <div className="pj-main-body">
        <div className="pj-benefits-box" style={{ maxWidth: '700px', margin: '0 auto 40px' }}>
          <h3>Create New Job Post</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
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

            <div className="input-group">
              <label>Job Field *</label>
              <select
                name="jobField"
                value={formData.jobField}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', background: 'white', fontSize: '1rem' }}
              >
                <option value="">Select job field</option>
                {jobFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
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

            <div className="input-group">
              <label>Job Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the job requirements, responsibilities, and expected deliverables..."
                rows="5"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', fontSize: '1rem', resize: 'vertical' }}
              />
            </div>

            {message && (
              <div style={{
                padding: '15px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center',
                background: messageType === 'success' ? '#d1fae5' : '#fee2e2',
                color: messageType === 'success' ? '#065f46' : '#991b1b',
                borderLeft: `4px solid ${messageType === 'success' ? '#10b981' : '#ef4444'}`
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-modern-primary"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '1.1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: 'white',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Posting Job...' : 'Post Job'}
            </button>
          </form>
        </div>

        {myJobs.length > 0 && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '20px' }}>My Posted Jobs</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myJobs.map(job => (
                <div key={job._id} style={{
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: 'white'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ margin: '0 0 8px 0' }}>{job.title}</h4>
                      <p style={{ margin: '0 0 8px 0', color: '#6b7280' }}>
                        <strong>Field:</strong> {job.jobField} | <strong>Budget:</strong> {job.budget}
                      </p>
                      <p style={{ margin: '0', color: '#6b7280', fontSize: '0.9rem' }}>
                        Status: <span style={{
                          color: job.status === 'open' ? '#10b981' : '#ef4444',
                          fontWeight: '600'
                        }}>{job.status.toUpperCase()}</span> | 
                        Applicants: {job.applicants.length}
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
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PostJob;
