import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="browse-wrapper">
        <section className="browse-header">
          <h1>Find Talent</h1>
          <p>As a job provider, you can post jobs and find freelancers.</p>
          
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => navigate('/post-job')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                marginRight: '10px'
              }}
            >
              Post a Job
            </button>
            <button
              onClick={() => navigate('/find-freelancers')}
              style={{
                padding: '12px 24px',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Find Freelancers
            </button>
          </div>
        </section>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="browse-wrapper">
        <section className="browse-header">
          <h1>Find Your Next Opportunity</h1>
          <p>Explore thousands of jobs tailored to your professional skills and experience levels.</p>
          
          <div className="filter-chips" style={{ marginTop: '20px' }}>
            <span>Filter by Field:</span>
            {jobFields.map(field => (
              <button 
                key={field} 
                className={`chip ${selectedField === field ? 'active' : ''}`}
                onClick={() => handleFieldFilter(field)}
                style={selectedField === field ? { background: '#2563eb', color: 'white' } : {}}
              >
                {field}
              </button>
            ))}
          </div>
        </section>

        <section className="discovery-section" style={{ padding: '20px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading jobs...</div>
          ) : filteredJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3>No jobs found</h3>
              <p>Check back later for new opportunities.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
              {filteredJobs.map(job => (
                <div key={job._id} style={{
                  padding: '25px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{job.title}</h3>
                      <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '0.95rem' }}>
                        <strong>Field:</strong> {job.jobField} | <strong>Budget:</strong> {job.budget}
                      </p>
                      <p style={{ margin: '0 0 15px 0', color: '#4b5563', lineHeight: '1.5' }}>
                        {job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description}
                      </p>
                      <p style={{ margin: '0', color: '#9ca3af', fontSize: '0.85rem' }}>
                        Posted by: {job.postedBy?.firstName} {job.postedBy?.lastName}
                      </p>
                    </div>
                    <div style={{ 
                      padding: '6px 12px', 
                      background: '#dbeafe', 
                      color: '#1e40af', 
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '500'
                    }}>
                      {job.applicants.length} applicants
                    </div>
                  </div>
                  <div style={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    background: '#fef3c7',
                    color: '#92400e',
                    borderRadius: '8px',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}>
                    🔑 Sign up to apply for this job
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="browse-wrapper">
      <section className="browse-header">
        <h1>Find Your Next Opportunity</h1>
        <p>Explore jobs that match your {user.jobField || 'skills'} expertise.</p>
        
        {user.jobField && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#d1fae5', borderRadius: '8px', display: 'inline-block' }}>
            <strong>Your Field:</strong> {user.jobField}
          </div>
        )}
        
        <div className="filter-chips" style={{ marginTop: '20px' }}>
          <span>Filter by Field:</span>
          {jobFields.map(field => (
            <button 
              key={field} 
              className={`chip ${selectedField === field ? 'active' : ''}`}
              onClick={() => handleFieldFilter(field)}
              style={selectedField === field ? { background: '#2563eb', color: 'white' } : {}}
            >
              {field}
            </button>
          ))}
        </div>
      </section>

      {applicationMessage && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 20px',
          padding: '15px',
          borderRadius: '12px',
          textAlign: 'center',
          background: applicationType === 'success' ? '#d1fae5' : '#fee2e2',
          color: applicationType === 'success' ? '#065f46' : '#991b1b'
        }}>
          {applicationMessage}
        </div>
      )}

      <section className="discovery-section" style={{ padding: '20px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading jobs...</div>
        ) : filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No jobs found</h3>
            <p>Check back later for new opportunities in your field.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
            {filteredJobs.map(job => (
              <div key={job._id} style={{
                padding: '25px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1f2937' }}>{job.title}</h3>
                    <p style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '0.95rem' }}>
                      <strong>Field:</strong> {job.jobField} | <strong>Budget:</strong> {job.budget}
                    </p>
                    <p style={{ margin: '0 0 15px 0', color: '#4b5563', lineHeight: '1.5' }}>
                      {job.description.length > 200 ? job.description.substring(0, 200) + '...' : job.description}
                    </p>
                    <p style={{ margin: '0', color: '#9ca3af', fontSize: '0.85rem' }}>
                      Posted by: {job.postedBy?.firstName} {job.postedBy?.lastName} ({job.postedBy?.username})
                    </p>
                  </div>
                  <div style={{ 
                    padding: '6px 12px', 
                    background: '#dbeafe', 
                    color: '#1e40af', 
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {job.applicants.length} applicants
                  </div>
                </div>

                {canApplyToJob(job) ? (
                  applyingJob === job._id ? (
                    <div style={{ marginTop: '20px', padding: '20px', background: '#f9fafb', borderRadius: '8px' }}>
                      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                        Your Proposal *
                      </label>
                      <textarea
                        value={proposal}
                        onChange={(e) => setProposal(e.target.value)}
                        placeholder="Explain why you're the best fit for this job..."
                        rows="4"
                        style={{ 
                          width: '100%', 
                          padding: '12px', 
                          borderRadius: '8px', 
                          border: '2px solid #e5e7eb',
                          fontSize: '1rem',
                          resize: 'vertical',
                          marginBottom: '15px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleApply(job._id)}
                          disabled={!proposal.trim()}
                          style={{
                            padding: '10px 20px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Submit Application
                        </button>
                        <button
                          onClick={() => { setApplyingJob(null); setProposal(''); }}
                          style={{
                            padding: '10px 20px',
                            background: '#e5e7eb',
                            color: '#374151',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setApplyingJob(job._id)}
                      style={{
                        marginTop: '20px',
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '1rem'
                      }}
                    >
                      Apply Now
                    </button>
                  )
                ) : (
                  <div style={{
                    marginTop: '20px',
                    padding: '12px 24px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '8px',
                    fontWeight: '500',
                    display: 'inline-block'
                  }}>
                    🔒 You can only apply to {user.jobField} jobs
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default BrowseApply;
