import { useEffect, useState } from "react";
import "./ProfilePopup.css";

const ProfilePopup = ({ userId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLargeProfilePicture, setShowLargeProfilePicture] = useState(false);
  const [showLargeImage, setShowLargeImage] = useState(false);
  const [largeImageUrl, setLargeImageUrl] = useState("");
  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("hirenest_user");

      if (!token || !userData) {
        setError("Please login to view profiles");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/users/${userId}`, {
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
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, API_BASE]);

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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleProfilePictureClick = () => {
    if (profile.profilePicture) {
      setShowLargeProfilePicture(true);
    }
  };

  const handleCloseLargeProfilePicture = () => {
    setShowLargeProfilePicture(false);
  };

  const handleOpenLargeImage = (imageUrl) => {
    setLargeImageUrl(imageUrl);
    setShowLargeImage(true);
  };

  const handleCloseLargeImage = () => {
    setShowLargeImage(false);
    setLargeImageUrl("");
  };

  if (loading) {
    return (
      <div className="profile-popup-overlay" onClick={handleOverlayClick}>
        <div className="profile-popup">
          <div className="profile-popup-loading">
            <div className="spinner"></div>
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-popup-overlay" onClick={handleOverlayClick}>
        <div className="profile-popup">
          <div className="profile-popup-error">
            <p>Error: {error}</p>
            <button onClick={onClose} className="profile-popup-close-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="profile-popup-overlay" onClick={handleOverlayClick}>
      <div className="profile-popup">
        <button className="profile-popup-close" onClick={onClose}>
          ×
        </button>
        
        <div className="profile-popup-header">
          <div 
            className="profile-popup-avatar"
            onClick={handleProfilePictureClick}
            style={{ cursor: profile.profilePicture ? 'pointer' : 'default' }}
          >
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={`${profile.firstName}'s profile`}
                className="profile-popup-avatar-img"
              />
            ) : (
              <span className="profile-popup-avatar-initials">
                {profile.firstName?.charAt(0)}
                {profile.lastName?.charAt(0)}
              </span>
            )}
          </div>
          <div className="profile-popup-header-info">
            <h2 className="profile-popup-name">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="profile-popup-username">@{profile.username}</p>
            <span className={`profile-popup-role-badge profile-popup-role-badge--${profile.role}`}>
              {getRoleDisplay(profile.role)}
            </span>
          </div>
        </div>

        <div className="profile-popup-content">
          <div className="profile-popup-section">
            <h3 className="profile-popup-section-title">Personal Information</h3>
            <div className="profile-popup-grid">
              <div className="profile-popup-field">
                <span className="profile-popup-field-label">Email</span>
                <span className="profile-popup-field-value">{profile.email}</span>
              </div>
              <div className="profile-popup-field">
                <span className="profile-popup-field-label">Username</span>
                <span className="profile-popup-field-value">@{profile.username}</span>
              </div>
            </div>
          </div>

          {profile.experience && profile.experience.length > 0 && (
            <div className="profile-popup-section">
              <h3 className="profile-popup-section-title">Experience</h3>
              <div className="profile-popup-list">
                {profile.experience.map((exp, index) => (
                  <div key={index} className="profile-popup-list-item">
                    <div className="profile-popup-list-item-header">
                      <h4 className="profile-popup-list-item-title">{exp.position}</h4>
                      {exp.isCurrent && <span className="profile-popup-current-badge">Current</span>}
                    </div>
                    <p className="profile-popup-list-item-subtitle">
                      <strong>Company:</strong> {exp.company}
                    </p>
                    <p className="profile-popup-list-item-date">
                      <strong>Duration:</strong> {formatDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDate(exp.endDate)}
                    </p>
                    {exp.description && (
                      <p className="profile-popup-list-item-desc">
                        <strong>Description:</strong> {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.education && profile.education.length > 0 && (
            <div className="profile-popup-section">
              <h3 className="profile-popup-section-title">Education</h3>
              <div className="profile-popup-list">
                {profile.education.map((edu, index) => (
                  <div key={index} className="profile-popup-list-item">
                    <div className="profile-popup-list-item-header">
                      <h4 className="profile-popup-list-item-title">{edu.degree}</h4>
                    </div>
                    <p className="profile-popup-list-item-subtitle">
                      <strong>Institution:</strong> {edu.institution}
                    </p>
                    {edu.fieldOfStudy && (
                      <p className="profile-popup-list-item-subtitle">
                        <strong>Field of Study:</strong> {edu.fieldOfStudy}
                      </p>
                    )}
                    <p className="profile-popup-list-item-date">
                      <strong>Duration:</strong> {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </p>
                    {edu.description && (
                      <p className="profile-popup-list-item-desc">
                        <strong>Description:</strong> {edu.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile.certificationImages && profile.certificationImages.length > 0 && (
            <div className="profile-popup-section">
              <h3 className="profile-popup-section-title">Certification Images</h3>
              <div className="profile-popup-images">
                {profile.certificationImages.map((img, index) => (
                  <div key={index} className="profile-popup-image-wrapper" onClick={() => handleOpenLargeImage(img)} style={{ cursor: 'pointer' }}>
                    <img src={img} alt={`Certification ${index + 1}`} className="profile-popup-image" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {showLargeImage && largeImageUrl && (
        <div className="profile-popup-large-image-modal" onClick={handleCloseLargeImage}>
          <div className="profile-popup-large-image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="profile-popup-large-image-modal-close" onClick={handleCloseLargeImage}>×</button>
            <img src={largeImageUrl} alt="Large view" className="profile-popup-large-image-modal-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePopup;
