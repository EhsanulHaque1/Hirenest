import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Pages.css";
import "./BrowseApply.css";

function BrowseApply() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [selectedField, setSelectedField] = useState('All');
  const [loading, setLoading] = useState(true);
  const [applyingJob, setApplyingJob] = useState(null);
  const [proposal, setProposal] = useState('');
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applicationType, setApplicationType] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem('token');

  const jobFields = ['All', 'Web Development', 'App Development', 'UI/UX Design', 'Marketing'];

  useEffect(() => {
    const savedUser = localStorage.getItem('hirenest_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      if (parsedUser.role === 'jobSeeker' && !parsedUser.profileComplete) {
        navigate('/create-profile');
      }
    }
    
    fetchJobs();
  }, [navigate, token]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const allRes = await fetch(`${API_BASE}/jobs`);
      if (allRes.ok) {
        const allData = await allRes.json();
        setJobs(allData);
        setFilteredJobs(allData);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const canApplyToJob = (job) => {
    return user.jobField && job.jobField === user.jobField;
  };

  const handleFieldFilter = (field) => {
    setSelectedField(field);
    if (field === 'All') {
      setFilteredJobs(jobs);
    } else {
      setFilteredJobs(jobs.filter(job => job.jobField === field));
    }
  };

  const handleApply = async (jobId) => {
    if (!proposal.trim()) {
      setApplicationMessage('Please write a proposal');
      setApplicationType('error');
      return;
    }

    setApplyingJob(jobId);
    try {
      const res = await fetch(`${API_BASE}/jobs/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId, proposal })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setApplicationMessage('Application submitted successfully! 🎉');
      setApplicationType('success');
      setProposal('');
      setApplyingJob(null);
    } catch (error) {
      setApplicationMessage(error.message);
      setApplicationType('error');
    }
  };

  const canApply = user && user.role === 'jobSeeker' && user.profileComplete;
  
  if (user && user.role === 'jobProvider') {
    return (
      <div className="page-container">
        <h1>Find Talent</h1>
        <p className="intro-text">
          As a job provider, you can post jobs and find freelancers.
        </p>
        
        <div className="content-section">
          <div className="filter-actions">
            <button
              onClick={() => navigate('/post-job')}
              className="btn-modern-primary"
            >
              Post a Job
            </button>
            <button
              onClick={() => navigate('/find-freelancers')}
              className="btn-modern-secondary"
            >
              Find Freelancers
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="page-container">
        <h1>Find Your Next Opportunity</h1>
        <p className="intro-text">
          Explore thousands of jobs tailored to your professional skills and experience levels.
        </p>
        
        <div className="content-section">
          <div className="filter-chips">
            <span className="filter-label">Filter by Field:</span>
            {jobFields.map(field => (
              <button 
                key={field} 
                className={`chip ${selectedField === field ? 'active' : ''}`}
                onClick={() => handleFieldFilter(field)}
              >
                {field}
              </button>
            ))}
          </div>
        </div>

        <section className="discovery-section">
          {loading ? (
            <div className="loading-message">Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="feature-card" style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ marginBottom: '8px' }}>No jobs found</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="content-section">
              <div className="browse-jobs-grid">
                {filteredJobs.map(job => (
                  <div key={job._id} className="feature-card browse-job-card">
                    <div className="browse-job-header">
                      <div className="browse-job-info">
                        <h3 className="browse-job-title">{job.title}</h3>
                        <p className="browse-job-meta">
                          <span>Field:</span> {job.jobField} | <span>Budget:</span> {job.budget}
                        </p>
                        <p className="browse-job-description">
                          {job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description}
                        </p>
                        <p className="browse-job-posted">
                          Posted by: {job.postedBy?.firstName} {job.postedBy?.lastName}
                        </p>
                      </div>
                      <div className="browse-applicants-badge">
                        {job.applicants.length} applicants
                      </div>
                    </div>
                    <div className="browse-signup-notice">
                      🔑 Sign up to apply for this job
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Find Your Next Opportunity</h1>
      <p className="intro-text">
        Explore jobs that match your {user.jobField || 'skills'} expertise.
      </p>
      
      {user.jobField && (
        <div className="user-field-badge">
          <strong>Your Field:</strong> {user.jobField}
        </div>
      )}
      
      <div className="content-section">
        <div className="filter-chips">
          <span className="filter-label">Filter by Field:</span>
          {jobFields.map(field => (
            <button 
              key={field} 
              className={`chip ${selectedField === field ? 'active' : ''}`}
              onClick={() => handleFieldFilter(field)}
            >
              {field}
            </button>
          ))}
        </div>
      </div>

      {applicationMessage && (
        <div className={applicationType === 'success' ? 'success-message' : 'error-message'}>
          {applicationMessage}
        </div>
      )}

      <section className="discovery-section">
        {loading ? (
          <div className="loading-message">Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="feature-card" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <h3 style={{ marginBottom: '8px' }}>No jobs found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Check back later for new opportunities in your field.</p>
          </div>
        ) : (
          <div className="content-section">
            <div className="browse-jobs-grid">
              {filteredJobs.map(job => (
                <div key={job._id} className="feature-card browse-job-card">
                  <div className="browse-job-header">
                    <div className="browse-job-info">
                      <h3 className="browse-job-title">{job.title}</h3>
                      <p className="browse-job-meta">
                        <span>Field:</span> {job.jobField} | <span>Budget:</span> {job.budget}
                      </p>
                      <p className="browse-job-description">
                        {job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description}
                      </p>
                      <p className="browse-job-posted">
                        Posted by: {job.postedBy?.firstName} {job.postedBy?.lastName} ({job.postedBy?.username})
                      </p>
                    </div>
                    <div className="browse-applicants-badge">
                      {job.applicants.length} applicants
                    </div>
                  </div>

                  {canApplyToJob(job) ? (
                    applyingJob === job._id ? (
                      <div className="browse-apply-form">
                        <label className="browse-apply-label">
                          Your Proposal *
                        </label>
                        <textarea
                          value={proposal}
                          onChange={(e) => setProposal(e.target.value)}
                          placeholder="Explain why you're the best fit for this job..."
                          rows="4"
                          className="browse-apply-textarea"
                        />
                        <div className="browse-apply-actions">
                          <button
                            onClick={() => handleApply(job._id)}
                            disabled={!proposal.trim()}
                            className="btn-modern-primary"
                          >
                            Submit Application
                          </button>
                          <button
                            onClick={() => { setApplyingJob(null); setProposal(''); }}
                            className="btn-modern-secondary"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setApplyingJob(job._id)}
                        className="btn-modern-primary"
                      >
                        Apply Now
                      </button>
                    )
                  ) : (
                    <div className="browse-field-restriction">
                      🔒 You can only apply to {user.jobField} jobs
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default BrowseApply;
