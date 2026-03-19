import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

const CreateProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [jobField, setJobField] = useState('');
  const [nidFiles, setNidFiles] = useState([]);
  const [certFiles, setCertFiles] = useState([]);
  const [previewNid, setPreviewNid] = useState([]);
  const [previewCerts, setPreviewCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); 

  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem('token');

  useEffect(() => {
    const savedUser = localStorage.getItem('hirenest_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setRole(parsedUser.role);
    }
    if (!token) navigate('/');
  }, [navigate, token]);

  const handleNidChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNidFiles(files);
      setPreviewNid(files.map(file => URL.createObjectURL(file)));
    }
  };

  const handleCertChange = (e) => {
    const files = Array.from(e.target.files);
    setCertFiles(files);
    setPreviewCerts(files.map(file => URL.createObjectURL(file)));
  };

  const jobFields = ['Web Development', 'App Development', 'UI/UX Design', 'Marketing'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (role === 'jobSeeker' && (!certFiles.length || !jobField)) {
      setMessage('Please upload certification photos and select your job field.');
      setMessageType('error');
      setLoading(false);
      return;
    }
    if (role === 'jobProvider' && nidFiles.length < 2) {
      setMessage('Please upload both front and back of your NID card.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    if (role === 'jobProvider') {
      nidFiles.forEach(file => formData.append('nidImages', file));
    } else {
      certFiles.forEach(file => formData.append('certificationImages', file));
      formData.append('jobField', jobField);
    }

    try {
      const res = await fetch(`${API_BASE}/auth/complete-profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      // Update localStorage
      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('hirenest_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage('Profile completed successfully! 🎉');
      setMessageType('success');
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      setMessage(error.message);
      setMessageType('error');
      console.error('Profile complete error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || !role) return <div className="page-container"><h1>Loading...</h1></div>;

  return (
    <div className="page-container">
      <h1>Complete Your Profile</h1>
      <p className="intro-text">
        Welcome {user.firstName}! Let's complete your {role === 'jobSeeker' ? 'seeker' : 'provider'} profile.
      </p>

      <div className="complaint-card-modern" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="complaint-header-modern">
          <div className="complaint-icon-modern">
            {role === 'jobProvider' ? '🏢' : '👤'}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{role === 'jobProvider' ? 'Verify Your Identity' : 'Showcase Your Skills'}</h2>
            <p className="complaint-subtitle">
              {role === 'jobProvider' 
                ? 'Upload your NID for verification' 
                : 'Upload certifications to prove your expertise'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="complaint-form-modern">
          {role === 'jobProvider' ? (
            <>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  NID Card Photos * <span style={{ fontWeight: '400', color: 'var(--text-secondary)' }}>(Front and Back - 2 images)</span>
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleNidChange} 
                  required 
                  style={{
                    padding: '12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    background: 'var(--bg-secondary)'
                  }}
                />
                {previewNid.length > 0 && (
                  <div style={{ display: 'flex', gap: '16px', marginTop: '16px', justifyContent: 'center' }}>
                    {previewNid.map((preview, idx) => (
                      <div key={idx} style={{ textAlign: 'center' }}>
                        <img 
                          src={preview} 
                          alt={`NID ${idx + 1}`} 
                          style={{ 
                            width: '180px', 
                            height: '120px', 
                            objectFit: 'cover', 
                            borderRadius: 'var(--radius-md)', 
                            border: '2px solid var(--border-light)',
                            boxShadow: 'var(--shadow-md)'
                          }} 
                        />
                        <p style={{ marginTop: '8px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                          {idx === 0 ? '📄 Front' : '📄 Back'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Certification Photos * <span style={{ fontWeight: '400', color: 'var(--text-secondary)' }}>(up to 5 images)</span>
                </label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleCertChange} 
                  required 
                  style={{
                    padding: '12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    background: 'var(--bg-secondary)'
                  }}
                />
                {previewCerts.length > 0 && (
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px', justifyContent: 'center' }}>
                    {previewCerts.map((preview, idx) => (
                      <div key={idx} style={{ textAlign: 'center' }}>
                        <img 
                          src={preview} 
                          alt={`Cert ${idx + 1}`} 
                          style={{ 
                            width: '120px', 
                            height: '120px', 
                            objectFit: 'cover', 
                            borderRadius: 'var(--radius-md)', 
                            border: '2px solid var(--border-light)',
                            boxShadow: 'var(--shadow-md)'
                          }} 
                        />
                        <p style={{ marginTop: '6px', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                          Cert {idx + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="input-group">
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Job Field *
                </label>
                <select 
                  value={jobField} 
                  onChange={(e) => setJobField(e.target.value)} 
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
                  <option value="">Select your expertise</option>
                  {jobFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
            </>
          )}

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
            {loading ? '⏳ Uploading to Cloudinary...' : `✨ Complete ${role} Profile`}
          </button>
        </form>
      </div>

    </div>
  );
};

export default CreateProfile;
