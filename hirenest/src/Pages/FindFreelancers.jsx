import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

function FindFreelancers() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobSeekers, setJobSeekers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState('All');
  const [zoomImage, setZoomImage] = useState(null);
  
  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem('token');

  const jobFields = ['All', 'Web Development', 'App Development', 'UI/UX Design', 'Marketing'];

  useEffect(() => {
    const savedUser = localStorage.getItem('hirenest_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    }
    
    fetchJobSeekers();
  }, []);

  const fetchJobSeekers = async () => {
    try {
      setLoading(true);
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/jobs/job-seekers`, { headers });
      
      if (res.ok) {
        const data = await res.json();
        setJobSeekers(data);
      }
    } catch (error) {
      console.error('Error fetching job seekers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = (seeker) => {
    localStorage.setItem('chat_with', JSON.stringify(seeker));
    navigate('/chat');
  };

  const filteredSeekers = selectedField === 'All' 
    ? jobSeekers 
    : jobSeekers.filter(s => s.jobField && s.jobField.includes(selectedField));

  const canChat = user && user.role === 'jobProvider';

  if (zoomImage) {
    return (
      <div 
        className="page-container" 
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          background: 'rgba(0,0,0,0.9)', 
          zIndex: 1000, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          cursor: 'pointer'
        }} 
        onClick={() => setZoomImage(null)}
      >
        <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%', cursor: 'default' }} onClick={(e) => e.stopPropagation()}>
          <img src={zoomImage} alt="Zoomed" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 'var(--radius-md)' }} />
          <button 
            onClick={() => setZoomImage(null)}
            className="btn-modern-primary"
            style={{
              position: 'absolute',
              top: '-50px',
              right: '0',
              padding: '12px 24px'
            }}
          >
            ✕ Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Find Freelancers</h1>
      <p className="intro-text">
        Browse and connect with talented freelancers for your projects.
      </p>

      {!canChat && (
        <div className="feature-card" style={{ 
          padding: '20px', 
          background: 'var(--gradient-primary)', 
          borderRadius: 'var(--radius-lg)', 
          marginBottom: '32px',
          color: 'white',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto 32px'
        }}>
          <p style={{ margin: 0, fontSize: '1.1rem' }}>💡 Only job providers can chat with freelancers. Sign up as a job provider to connect with talent.</p>
        </div>
      )}

      <div className="content-section">
        <h2>Filter by Field</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px', justifyContent: 'center' }}>
          {jobFields.map(field => (
            <button
              key={field}
              onClick={() => setSelectedField(field)}
              className={selectedField === field ? 'btn-modern-primary' : 'btn-modern-secondary'}
              style={selectedField === field ? { padding: '12px 24px' } : { padding: '12px 24px', borderRadius: 'var(--radius-full)' }}
            >
              {field}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="feature-card" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
            <p style={{ color: 'var(--text-secondary)' }}>Loading freelancers...</p>
          </div>
        ) : filteredSeekers.length === 0 ? (
          <div className="feature-card" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <h3>No freelancers found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Check back later for new talent in your field.</p>
          </div>
        ) : (
          <div className="features-grid">
            {filteredSeekers.map(seeker => (
              <div key={seeker._id} className="feature-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  {seeker.profilePicture ? (
                    <img 
                      src={seeker.profilePicture}
                      alt={`${seeker.firstName} ${seeker.lastName}`}
                      style={{
                        width: '70px',
                        height: '70px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '3px solid var(--primary-green)',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '70px',
                      height: '70px',
                      borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '28px',
                      fontWeight: 'bold',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                    }}>
                      {seeker.firstName?.charAt(0)}{seeker.lastName?.charAt(0)}
                    </div>
                  )}
                  <div style={{ marginLeft: '16px' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem' }}>{seeker.firstName} {seeker.lastName}</h3>
                    <p 
                      style={{ margin: 0, color: 'var(--primary-green)', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600' }}
                      onClick={() => navigate(`/profile/${seeker._id}`)}
                    >
                      @{seeker.username}
                    </p>
                  </div>
                </div>

                {seeker.averageRating > 0 && (
                  <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{ 
                          color: star <= Math.round(seeker.averageRating) ? '#f59e0b' : '#d1d5db',
                          fontSize: '18px'
                        }}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {seeker.averageRating.toFixed(1)}
                    </span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      ({seeker.ratings?.length || 0} reviews)
                    </span>
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    background: 'var(--gradient-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                  }}>
                    {Array.isArray(seeker.jobField) 
                      ? seeker.jobField.join(' • ') 
                      : seeker.jobField}
                  </span>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <p style={{ margin: '0', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Jobs Completed:</span> {seeker.jobsCompleted || 0}
                  </p>
                </div>

                {seeker.certificationImages && seeker.certificationImages.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      <strong>Qualifications:</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {seeker.certificationImages.slice(0, 3).map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`Cert ${idx + 1}`}
                          onClick={() => setZoomImage(img)}
                          style={{
                            width: '70px',
                            height: '70px',
                            objectFit: 'cover',
                            borderRadius: 'var(--radius-md)',
                            border: '2px solid var(--border-light)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s'
                          }}
                        />
                      ))}
                      {seeker.certificationImages.length > 3 && (
                        <div style={{
                          width: '70px',
                          height: '70px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'var(--bg-tertiary)',
                          borderRadius: 'var(--radius-md)',
                          fontSize: '0.9rem',
                          color: 'var(--text-secondary)',
                          fontWeight: '600'
                        }}>
                          +{seeker.certificationImages.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {seeker.ratings && seeker.ratings.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                      <strong>Recent Reviews:</strong>
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {seeker.ratings.slice(0, 2).map((rating, idx) => (
                        <div key={idx} style={{ 
                          padding: '12px', 
                          background: 'var(--bg-secondary)', 
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-light)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', gap: '2px' }}>
                              {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} style={{ 
                                  color: star <= rating.rating ? '#f59e0b' : '#d1d5db',
                                  fontSize: '14px'
                                }}>
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          {rating.comment && (
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              "{rating.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                      {seeker.ratings.length > 2 && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--primary-green)' }}>
                          +{seeker.ratings.length - 2} more reviews
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {canChat ? (
                  <button
                    onClick={() => handleChat(seeker)}
                    className="btn-modern-primary"
                    style={{ width: '100%', padding: '14px' }}
                  >
                    💬 Chat with Freelancer
                  </button>
                ) : (
                  <button
                    disabled
                    className="btn-modern-secondary"
                    style={{ width: '100%', padding: '14px', cursor: 'not-allowed' }}
                  >
                    🔒 Chat available for job providers
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default FindFreelancers;
