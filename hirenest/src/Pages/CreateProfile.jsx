import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Pages.css";

const CreateProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [selectedJobFields, setSelectedJobFields] = useState([]);
  const [nidFiles, setNidFiles] = useState([]);
  const [certFiles, setCertFiles] = useState([]);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [previewNid, setPreviewNid] = useState([]);
  const [previewCerts, setPreviewCerts] = useState([]);
  const [previewProfilePic, setPreviewProfilePic] = useState(null);
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
      setFirstName(parsedUser.firstName || '');
      setLastName(parsedUser.lastName || '');
      if (parsedUser.profilePicture) {
        setPreviewProfilePic(parsedUser.profilePicture);
      }
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

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPreviewProfilePic(URL.createObjectURL(file));
    }
  };

  const removeNidImage = (index) => {
    const newFiles = nidFiles.filter((_, idx) => idx !== index);
    const newPreviews = previewNid.filter((_, idx) => idx !== index);
    setNidFiles(newFiles);
    setPreviewNid(newPreviews);
  };

  const removeCertImage = (index) => {
    const newFiles = certFiles.filter((_, idx) => idx !== index);
    const newPreviews = previewCerts.filter((_, idx) => idx !== index);
    setCertFiles(newFiles);
    setPreviewCerts(newPreviews);
  };

  const removeProfilePic = () => {
    setProfilePicFile(null);
    setPreviewProfilePic(null);
  };

  const jobFields = ['Web Development', 'App Development', 'UI/UX Design', 'Marketing'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    if (role === 'jobSeeker' && (!certFiles.length || selectedJobFields.length === 0)) {
      setMessage('Please upload certification photos and select at least one job field.');
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
    
    formData.append('firstName', firstName);
    formData.append('lastName', lastName);
    
    if (profilePicFile) {
      formData.append('profilePicture', profilePicFile);
    }
    if (role === 'jobProvider') {
      nidFiles.forEach(file => formData.append('nidImages', file));
    } else {
      certFiles.forEach(file => formData.append('certificationImages', file));
      formData.append('jobField', JSON.stringify(selectedJobFields));
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
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Your Name
            </label>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <input 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                  style={{
                    padding: '12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    fontSize: '1rem'
                  }}
                />
              </div>
              <div style={{ flex: '1', minWidth: '150px' }}>
                <input 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                  style={{
                    padding: '12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    fontSize: '1rem'
                  }}
                />
              </div>
            </div>
          </div>

          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Profile Picture <span style={{ fontWeight: '400', color: 'var(--text-secondary)' }}>(optional)</span>
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid var(--primary-green)',
                background: 'var(--bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {previewProfilePic ? (
                  <img 
                    src={previewProfilePic} 
                    alt="Profile" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '40px', color: 'var(--text-secondary)' }}>👤</span>
                )}
              </div>
              <div>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleProfilePicChange}
                  style={{
                    padding: '12px',
                    border: '2px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    width: '250px',
                    background: 'var(--bg-secondary)'
                  }}
                />
                {previewProfilePic && (
                  <button
                    type="button"
                    onClick={removeProfilePic}
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

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
                      <div key={idx} style={{ textAlign: 'center', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => removeNidImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1
                          }}
                        >
                          ✕
                        </button>
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
                      <div key={idx} style={{ textAlign: 'center', position: 'relative' }}>
                        <button
                          type="button"
                          onClick={() => removeCertImage(idx)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1
                          }}
                        >
                          ✕
                        </button>
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
                  Job Fields * <span style={{ fontWeight: '400', color: 'var(--text-secondary)' }}>(Select one or more)</span>
                </label>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '12px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)', 
                  border: '2px solid var(--border-light)', 
                  background: 'var(--bg-primary)'
                }}>
                  {jobFields.map(field => (
                    <label key={field} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedJobFields.includes(field) ? 'var(--primary-green)' : 'var(--bg-secondary)',
                      color: selectedJobFields.includes(field) ? 'white' : 'var(--text-primary)',
                      border: '1px solid var(--border-light)',
                      transition: 'all 0.2s ease'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={selectedJobFields.includes(field)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedJobFields([...selectedJobFields, field]);
                          } else {
                            setSelectedJobFields(selectedJobFields.filter(f => f !== field));
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem' }}>{field}</span>
                    </label>
                  ))}
                </div>
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
