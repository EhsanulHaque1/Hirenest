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
    : jobSeekers.filter(s => s.jobField === selectedField);

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
          <img src={zoomImage} alt="Zoomed" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: '8px' }} />
          <button 
            onClick={() => setZoomImage(null)}
            style={{
              position: 'absolute',
              top: '-40px',
              right: '0',
              padding: '10px 20px',
              background: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
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
        <div style={{ 
          padding: '15px', 
          background: '#fef3c7', 
          borderRadius: '8px', 
          marginBottom: '20px',
          color: '#92400e'
        }}>
          💡 Only job providers can chat with freelancers. Sign up as a job provider to connect with talent.
        </div>
      )}

      <div className="content-section">
        <h2>Filter by Field</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '30px' }}>
          {jobFields.map(field => (
            <button
              key={field}
              onClick={() => setSelectedField(field)}
              style={{
                padding: '10px 20px',
                borderRadius: '20px',
                border: 'none',
                background: selectedField === field ? '#2563eb' : '#e5e7eb',
                color: selectedField === field ? 'white' : '#374151',
                cursor: 'pointer',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              {field}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading freelancers...</div>
        ) : filteredSeekers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No freelancers found</h3>
            <p>Check back later for new talent in your field.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {filteredSeekers.map(seeker => (
              <div key={seeker._id} style={{
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                background: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: '#6b7280'
                  }}>
                    {seeker.firstName?.charAt(0)}{seeker.lastName?.charAt(0)}
                  </div>
                  <div style={{ marginLeft: '15px' }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>{seeker.firstName} {seeker.lastName}</h3>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>@{seeker.username}</p>
                  </div>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    background: '#dbeafe',
                    color: '#1e40af',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '500'
                  }}>
                    {seeker.jobField}
                  </span>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                    <strong>Jobs Completed:</strong> {seeker.jobsCompleted || 0}
                  </p>
                </div>

                {seeker.certificationImages && seeker.certificationImages.length > 0 && (
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#6b7280' }}>
                      <strong>Qualifications:</strong>
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {seeker.certificationImages.slice(0, 3).map((img, idx) => (
                        <img 
                          key={idx}
                          src={img} 
                          alt={`Cert ${idx + 1}`}
                          onClick={() => setZoomImage(img)}
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                      {seeker.certificationImages.length > 3 && (
                        <div style={{
                          width: '60px',
                          height: '60px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: '#f3f4f6',
                          borderRadius: '8px',
                          fontSize: '0.8rem',
                          color: '#6b7280'
                        }}>
                          +{seeker.certificationImages.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {canChat ? (
                  <button
                    onClick={() => handleChat(seeker)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    💬 Chat with Freelancer
                  </button>
                ) : (
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#e5e7eb',
                      color: '#9ca3af',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '1rem',
                      cursor: 'not-allowed'
                    }}
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
