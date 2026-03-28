import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editData, setEditData] = useState({});
  const fileInputRef = useRef(null);
  const certFileInputRef = useRef(null);
  const [newCertImages, setNewCertImages] = useState([]);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [largeImageUrl, setLargeImageUrl] = useState("");
  const navigate = useNavigate();
  const { userId } = useParams();
  const API_BASE = import.meta.env.VITE_API_URL || "/api";
  
  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !userId;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("hirenest_user");

      if (!token || !userData) {
        navigate("/");
        return;
      }

      try {
        // Determine which endpoint to use based on whether viewing own profile or another user's
        const endpoint = isOwnProfile 
          ? `${API_BASE}/auth/profile`
          : `${API_BASE}/users/${userId}`;
        
        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to fetch profile");
        }

        const data = await res.json();
        setProfile(data);
        setEditData(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, API_BASE, userId, isOwnProfile]);

  const handleProfilePictureChange = async (e) => {
    if (!isEditing) return;
    
    const file = e.target.files[0];
    if (!file) return;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        navigate("/");
        return;
      }
      const formData = new FormData();
    formData.append("profilePicture", file);

    setUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Server response:", text);
        throw new Error(text || "Failed to update profile picture");
      }

      const data = await res.json();
      setProfile(data.user);
      setEditData(data.user);
      
      // Update localStorage user data
      const userData = JSON.parse(localStorage.getItem("hirenest_user"));
      userData.profilePicture = data.user.profilePicture;
      localStorage.setItem("hirenest_user", JSON.stringify(userData));
      
      alert("Profile picture updated successfully!");
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleAddExperience = () => {
    const newExp = {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      isCurrent: false,
    };
    setEditData({
      ...editData,
      experience: [...(editData.experience || []), newExp],
    });
  };

  const handleAddEducation = () => {
    const newEdu = {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    };
    setEditData({
      ...editData,
      education: [...(editData.education || []), newEdu],
    });
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExp = [...editData.experience];
    updatedExp[index] = { ...updatedExp[index], [field]: value };
    setEditData({ ...editData, experience: updatedExp });
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEdu = [...editData.education];
    updatedEdu[index] = { ...updatedEdu[index], [field]: value };
    setEditData({ ...editData, education: updatedEdu });
  };

  const handleRemoveExperience = (index) => {
    const updatedExp = editData.experience.filter((_, i) => i !== index);
    setEditData({ ...editData, experience: updatedExp });
  };

  const handleRemoveEducation = (index) => {
    const updatedEdu = editData.education.filter((_, i) => i !== index);
    setEditData({ ...editData, education: updatedEdu });
  };

  const handleCertImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setNewCertImages([...newCertImages, ...files]);
    }
  };

  const handleRemoveNewCertImage = (index) => {
    setNewCertImages(newCertImages.filter((_, i) => i !== index));
  };

  const handleOpenLargeImage = (imageUrl) => {
    setLargeImageUrl(imageUrl);
    setShowLargeImage(true);
  };

  const handleCloseLargeImage = () => {
    setShowLargeImage(false);
    setLargeImageUrl("");
  };

  const handleSaveChanges = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login again");
        navigate("/");
        return;
      }
      setUpdating(true);
    
    try {
      // If there are new certification images, use FormData
      if (newCertImages.length > 0) {
        const formData = new FormData();
        formData.append("firstName", editData.firstName);
        formData.append("lastName", editData.lastName);
formData.append("jobField", JSON.stringify(editData.jobField || []));
        formData.append("experience", JSON.stringify(editData.experience || []));
        formData.append("education", JSON.stringify(editData.education || []));
        
        newCertImages.forEach((file) => {
          formData.append("certificationImages", file);
        });

        const res = await fetch(`${API_BASE}/auth/profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Server response:", text);
          throw new Error(text || "Failed to update profile");
        }

        const data = await res.json();
        setProfile(data.user);
        setEditData(data.user);
        setNewCertImages([]);
      } else {
        // No new images, use JSON
        const res = await fetch(`${API_BASE}/auth/profile`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            firstName: editData.firstName,
            lastName: editData.lastName,
            jobField: editData.jobField,
            experience: editData.experience,
            education: editData.education,
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Server response:", text);
          throw new Error(text || "Failed to update profile");
        }

        const data = await res.json();
        setProfile(data.user);
        setEditData(data.user);
      }
      
      setIsEditing(false);
      
      // Update localStorage user data
      const userData = JSON.parse(localStorage.getItem("hirenest_user"));
      userData.firstName = editData.firstName;
      userData.lastName = editData.lastName;
      userData.jobField = editData.jobField;
      localStorage.setItem("hirenest_user", JSON.stringify(userData));
      
      alert("Profile updated successfully!");
      // Navigate back with refresh state to ensure BrowseApply gets updated user data
      navigate(-1, { state: { refreshUser: true } });
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page-container">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page-container">
        <div className="profile-error">
          <p>Error: {error}</p>
          <button onClick={() => navigate(-1)} className="profile-btn profile-btn--secondary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  const getRoleDisplay = (role) => {
    if (role === "jobSeeker") return "Job Seeker";
    if (role === "jobProvider") return "Job Provider";
    return role;
  };

  return (
    <div className="profile-page-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large" onClick={() => {
            if (isOwnProfile && isEditing) {
              fileInputRef.current?.click();
            } else if (profile.profilePicture) {
              handleOpenLargeImage(profile.profilePicture);
            }
          }} style={{ cursor: (isOwnProfile && isEditing) || profile.profilePicture ? 'pointer' : 'default' }}>
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={`${profile.firstName}'s profile`}
                className="profile-avatar-img"
              />
            ) : (
              <span className="profile-avatar-initials">
                {profile.firstName?.charAt(0)}
                {profile.lastName?.charAt(0)}
              </span>
            )}
            {isOwnProfile && isEditing && (
              <div className="profile-avatar-overlay">
                <span>Change Photo</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleProfilePictureChange}
            accept="image/*"
            style={{ display: "none" }}
          />
          <div className="profile-header-info">
            {isEditing ? (
              <div className="profile-edit-name">
                <input
                  type="text"
                  value={editData.firstName || ""}
                  onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                  placeholder="First Name"
                  className="profile-input"
                />
                <input
                  type="text"
                  value={editData.lastName || ""}
                  onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                  placeholder="Last Name"
                  className="profile-input"
                />
              </div>
            ) : (
              <h1 className="profile-name">
                {profile.firstName} {profile.lastName}
              </h1>
            )}
            <p className="profile-username">@{profile.username}</p>
            <span className={`profile-role-badge profile-role-badge--${profile.role}`}>
              {getRoleDisplay(profile.role)}
            </span>
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2 className="profile-section-title">Personal Information</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <span className="profile-field-label">Email</span>
                <span className="profile-field-value">{profile.email}</span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Username</span>
                <span className="profile-field-value">@{profile.username}</span>
              </div>

            </div>
          </div>

          {profile.role === 'jobSeeker' && (
            <div className="profile-section">
              <h2 className="profile-section-title">Job Fields</h2>
              {isEditing ? (
                <div className="profile-jobfields-edit">
                  <p className="profile-jobfields-hint">Select one or more job fields you're interested in:</p>
                  <div className="profile-jobfields-checkboxes">
                    {['Web Development', 'App Development', 'UI/UX Design', 'Marketing'].map((field) => (
                      <label key={field} className="profile-jobfield-checkbox">
                        <input
                          type="checkbox"
                          checked={(editData.jobField || []).includes(field)}
                          onChange={(e) => {
                            const currentFields = editData.jobField || [];
                            if (e.target.checked) {
                              setEditData({
                                ...editData,
                                jobField: [...currentFields, field]
                              });
                            } else {
                              setEditData({
                                ...editData,
                                jobField: currentFields.filter(f => f !== field)
                              });
                            }
                          }}
                        />
                        <span>{field}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="profile-jobfields-display">
                  {(profile.jobField || []).length > 0 ? (
                    <div className="profile-jobfields-list">
                      {profile.jobField.map((field, index) => (
                        <span key={index} className="profile-jobfield-badge">{field}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="profile-empty">No job fields selected</p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="profile-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">Experience</h2>
              {isEditing && isOwnProfile && (
                <button onClick={handleAddExperience} className="profile-add-btn">
                  + Add Experience
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="profile-edit-list">
                {(editData.experience || []).map((exp, index) => (
                  <div key={index} className="profile-edit-item">
                    <div className="profile-edit-row">
                      <div className="profile-edit-field">
                        <label>Company Name</label>
                        <input
                          type="text"
                          value={exp.company || ""}
                          onChange={(e) => handleExperienceChange(index, "company", e.target.value)}
                          placeholder="Enter company name"
                          className="profile-input"
                        />
                      </div>
                      <div className="profile-edit-field">
                        <label>Position</label>
                        <input
                          type="text"
                          value={exp.position || ""}
                          onChange={(e) => handleExperienceChange(index, "position", e.target.value)}
                          placeholder="Enter position"
                          className="profile-input"
                        />
                      </div>
                    </div>
                    <div className="profile-edit-row">
                      <div className="profile-edit-field">
                        <label>Start Date</label>
                        <input
                          type="date"
                          value={exp.startDate ? exp.startDate.split("T")[0] : ""}
                          onChange={(e) => handleExperienceChange(index, "startDate", e.target.value)}
                          className="profile-input"
                        />
                      </div>
                      <div className="profile-edit-field">
                        <label>End Date</label>
                        <input
                          type="date"
                          value={exp.endDate ? exp.endDate.split("T")[0] : ""}
                          onChange={(e) => handleExperienceChange(index, "endDate", e.target.value)}
                          className="profile-input"
                          disabled={exp.isCurrent}
                        />
                      </div>
                      <label className="profile-checkbox">
                        <input
                          type="checkbox"
                          checked={exp.isCurrent || false}
                          onChange={(e) => handleExperienceChange(index, "isCurrent", e.target.checked)}
                        />
                        Currently Working
                      </label>
                    </div>
                    <div className="profile-edit-field">
                      <label>Description</label>
                      <textarea
                        value={exp.description || ""}
                        onChange={(e) => handleExperienceChange(index, "description", e.target.value)}
                        placeholder="Describe your responsibilities and achievements"
                        className="profile-textarea"
                      />
                    </div>
                    <button onClick={() => handleRemoveExperience(index)} className="profile-remove-btn">
                      Remove
                    </button>
                  </div>
                ))}
                {(!editData.experience || editData.experience.length === 0) && (
                  <p className="profile-empty">No experience added yet. Click "Add Experience" to add one.</p>
                )}
              </div>
            ) : (
              <div className="profile-list">
                {(profile.experience && profile.experience.length > 0) ? (
                  profile.experience.map((exp, index) => (
                    <div key={index} className="profile-list-item">
                      <div className="profile-list-item-header">
                        <h3 className="profile-list-item-title">{exp.position}</h3>
                        {exp.isCurrent && <span className="profile-current-badge">Current</span>}
                      </div>
                      <p className="profile-list-item-subtitle"><strong>Company:</strong> {exp.company}</p>
                      <p className="profile-list-item-date">
                        <strong>Duration:</strong> {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                      </p>
                      {exp.description && <p className="profile-list-item-desc"><strong>Description:</strong> {exp.description}</p>}
                    </div>
                  ))
                ) : (
                  <p className="profile-empty">No experience added yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="profile-section">
            <div className="profile-section-header">
              <h2 className="profile-section-title">Education</h2>
              {isEditing && isOwnProfile && (
                <button onClick={handleAddEducation} className="profile-add-btn">
                  + Add Education
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="profile-edit-list">
                {(editData.education || []).map((edu, index) => (
                  <div key={index} className="profile-edit-item">
                    <div className="profile-edit-row">
                      <div className="profile-edit-field">
                        <label>Institution</label>
                        <input
                          type="text"
                          value={edu.institution || ""}
                          onChange={(e) => handleEducationChange(index, "institution", e.target.value)}
                          placeholder="Enter institution name"
                          className="profile-input"
                        />
                      </div>
                      <div className="profile-edit-field">
                        <label>Degree</label>
                        <select
                          value={edu.degree || ""}
                          onChange={(e) => handleEducationChange(index, "degree", e.target.value)}
                          className="profile-select"
                        >
                          <option value="">Select Degree</option>
                          <option value="SSC">SSC</option>
                          <option value="HSC">HSC</option>
                          <option value="Diploma">Diploma</option>
                          <option value="BSc">BSc (Bachelor of Science)</option>
                          <option value="BBA">BBA (Bachelor of Business Administration)</option>
                          <option value="BA">BA (Bachelor of Arts)</option>
                          <option value="BCom">BCom (Bachelor of Commerce)</option>
                          <option value="MSc">MSc (Master of Science)</option>
                          <option value="MBA">MBA (Master of Business Administration)</option>
                          <option value="MA">MA (Master of Arts)</option>
                          <option value="MCom">MCom (Master of Commerce)</option>
                          <option value="PhD">PhD</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="profile-edit-field">
                      <label>Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy || ""}
                        onChange={(e) => handleEducationChange(index, "fieldOfStudy", e.target.value)}
                        placeholder="Enter field of study"
                        className="profile-input"
                      />
                    </div>
                    <div className="profile-edit-row">
                      <div className="profile-edit-field">
                        <label>Start Date</label>
                        <input
                          type="date"
                          value={edu.startDate ? edu.startDate.split("T")[0] : ""}
                          onChange={(e) => handleEducationChange(index, "startDate", e.target.value)}
                          className="profile-input"
                        />
                      </div>
                      <div className="profile-edit-field">
                        <label>End Date</label>
                        <input
                          type="date"
                          value={edu.endDate ? edu.endDate.split("T")[0] : ""}
                          onChange={(e) => handleEducationChange(index, "endDate", e.target.value)}
                          className="profile-input"
                        />
                      </div>
                    </div>
                    <div className="profile-edit-field">
                      <label>Description</label>
                      <textarea
                        value={edu.description || ""}
                        onChange={(e) => handleEducationChange(index, "description", e.target.value)}
                        placeholder="Describe your education"
                        className="profile-textarea"
                      />
                    </div>
                    <button onClick={() => handleRemoveEducation(index)} className="profile-remove-btn">
                      Remove
                    </button>
                  </div>
                ))}
                {(!editData.education || editData.education.length === 0) && (
                  <p className="profile-empty">No education added yet. Click "Add Education" to add one.</p>
                )}
              </div>
            ) : (
              <div className="profile-list">
                {(profile.education && profile.education.length > 0) ? (
                  profile.education.map((edu, index) => (
                    <div key={index} className="profile-list-item">
                      <div className="profile-list-item-header">
                        <h3 className="profile-list-item-title">{edu.degree}</h3>
                      </div>
                      <p className="profile-list-item-subtitle"><strong>Institution:</strong> {edu.institution}</p>
                      {edu.fieldOfStudy && <p className="profile-list-item-subtitle"><strong>Field of Study:</strong> {edu.fieldOfStudy}</p>}
                      <p className="profile-list-item-date">
                        <strong>Duration:</strong> {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                      </p>
                      {edu.description && <p className="profile-list-item-desc"><strong>Description:</strong> {edu.description}</p>}
                    </div>
                  ))
                ) : (
                  <p className="profile-empty">No education added yet.</p>
                )}
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2 className="profile-section-title">Account Status</h2>
            <div className="profile-grid">
              <div className="profile-field">
                <span className="profile-field-label">Email Verified</span>
                <span className="profile-field-value">
                  {profile.isVerified ? (
                    <span className="profile-status profile-status--verified">✓ Verified</span>
                  ) : (
                    <span className="profile-status profile-status--unverified">✗ Not Verified</span>
                  )}
                </span>
              </div>
              <div className="profile-field">
                <span className="profile-field-label">Profile Status</span>
                <span className="profile-field-value">
                  {profile.profileComplete ? (
                    <span className="profile-status profile-status--verified">✓ Complete</span>
                  ) : (
                    <span className="profile-status profile-status--unverified">✗ Incomplete</span>
                  )}
                </span>
              </div>
              {profile.role === 'jobProvider' && (
                <div className="profile-field">
                  <span className="profile-field-label">NID Status</span>
                  <span className="profile-field-value">
                    <span className="profile-status profile-status--verified">✓ Verified</span>
                  </span>
                </div>
              )}
              <div className="profile-field">
                <span className="profile-field-label">Account Created</span>
                <span className="profile-field-value">{formatDate(profile.createdAt)}</span>
              </div>
              {profile.averageRating > 0 && (
                <div className="profile-field">
                  <span className="profile-field-label">Average Rating</span>
                  <span className="profile-field-value">
                    <span className="profile-rating">
                      {"★".repeat(Math.floor(profile.averageRating))}
                      {"☆".repeat(5 - Math.floor(profile.averageRating))}
                      <span className="profile-rating-number">({profile.averageRating.toFixed(1)})</span>
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>



          {profile.certificationImages && profile.certificationImages.length > 0 && (
            <div className="profile-section">
              <div className="profile-section-header">
                <h2 className="profile-section-title">Certification Images</h2>
              </div>
              <div className="profile-images">
                {profile.certificationImages.map((img, index) => (
                  <div key={index} className="profile-image-wrapper" onClick={() => handleOpenLargeImage(img)} style={{ cursor: 'pointer' }}>
                    <img src={img} alt={`Certification ${index + 1}`} className="profile-image" />
                  </div>
                ))}
              </div>
              {isEditing && isOwnProfile && (
                <div className="profile-upload-section" style={{ marginTop: '16px' }}>
                  <p className="profile-upload-label">Add more certifications:</p>
                  <input
                    type="file"
                    ref={certFileInputRef}
                    onChange={handleCertImageChange}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                  />
                  <button 
                    type="button" 
                    onClick={() => certFileInputRef.current?.click()}
                    className="profile-add-btn"
                  >
                    + Add Certification Images
                  </button>
                  {newCertImages.length > 0 && (
                    <div className="profile-new-images" style={{ marginTop: '12px' }}>
                      <p>New images selected:</p>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                        {newCertImages.map((file, index) => (
                          <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`New ${index + 1}`} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                            />
                            <button
                              onClick={() => handleRemoveNewCertImage(index)}
                              style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                background: 'red',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '20px',
                                height: '20px',
                                cursor: 'pointer',
                                fontSize: '12px',
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {!profile.certificationImages || profile.certificationImages.length === 0 && isEditing && isOwnProfile && (
            <div className="profile-section">
              <h2 className="profile-section-title">Certification Images</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '12px' }}>No certifications added yet. You can add certifications below:</p>
              <input
                type="file"
                ref={certFileInputRef}
                onChange={handleCertImageChange}
                accept="image/*"
                multiple
                style={{ display: 'none' }}
              />
              <button 
                type="button" 
                onClick={() => certFileInputRef.current?.click()}
                className="profile-add-btn"
              >
                + Add Certification Images
              </button>
              {newCertImages.length > 0 && (
                <div className="profile-new-images" style={{ marginTop: '12px' }}>
                  <p>New images selected:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {newCertImages.map((file, index) => (
                      <div key={index} style={{ position: 'relative', width: '80px', height: '80px' }}>
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt={`New ${index + 1}`} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                        />
                        <button
                          onClick={() => handleRemoveNewCertImage(index)}
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: 'red',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-actions">
          {isEditing ? (
            <>
              <button 
                onClick={handleSaveChanges} 
                className="profile-btn profile-btn--primary"
                disabled={updating}
              >
                {updating ? "Saving..." : "Save Changes"}
              </button>
              <button 
                onClick={() => { setIsEditing(false); setEditData(profile); }} 
                className="profile-btn profile-btn--secondary"
                disabled={updating}
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              {isOwnProfile && (
                <button onClick={() => setIsEditing(true)} className="profile-btn profile-btn--primary">
                  Edit Profile
                </button>
              )}
              <button onClick={() => navigate("/dashboard")} className="profile-btn profile-btn--secondary">
                Go to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
      {showLargeImage && largeImageUrl && (
        <div className="large-image-modal" onClick={handleCloseLargeImage}>
          <div className="large-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="large-image-modal-close" onClick={handleCloseLargeImage}>×</button>
            <img src={largeImageUrl} alt="Large view" className="large-image-modal-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
