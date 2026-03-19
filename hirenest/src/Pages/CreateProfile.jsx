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

      <form onSubmit={handleSubmit} className="content-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h2>{role === 'jobProvider' ? 'Upload NID Card Photo' : 'Upload Certification Photos & Select Job Type'}</h2>

        {role === 'jobProvider' ? (
          <>
            <div className="input-group">
              <label>NID Card Photos * (Front and Back - 2 images, JPG/PNG)</label>
              <input type="file" accept="image/*" multiple onChange={handleNidChange} required />
              {previewNid.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  {previewNid.map((preview, idx) => (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <img src={preview} alt={`NID ${idx + 1}`} style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb' }} />
                      <small>{idx === 0 ? 'Front' : 'Back'}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="input-group">
              <label>Certification Photos * (up to 5, JPG/PNG)</label>
              <input type="file" multiple accept="image/*" onChange={handleCertChange} required />
              {previewCerts.length > 0 && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                  {previewCerts.map((preview, idx) => (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <img src={preview} alt={`Cert ${idx + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #e5e7eb' }} />
                      <small>Cert {idx + 1}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="input-group">
              <label>Job Field * </label>
              <select value={jobField} onChange={(e) => setJobField(e.target.value)} required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #e5e7eb', background: 'white', fontSize: '1rem' }}>
                <option value="">Select your expertise</option>
                {jobFields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>
          </>
        )}

        {message && (
          <div style={{ 
            padding: '15px', 
            borderRadius: '12px', 
            margin: '20px 0', 
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
          {loading ? 'Uploading to Cloudinary...' : `Complete ${role} Profile`}
        </button>
      </form>

    </div>
  );
};

export default CreateProfile;

