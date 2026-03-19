import "./Pages.css";
import { Link } from "react-router-dom";

function FindJobs() {
  const jobCategories = [
    { 
      name: "Recent Jobs", 
      count: 245,
      icon: "📋",
      color: "#10b981"
    },
    { 
      name: "Top Paying", 
      count: 89,
      icon: "💰",
      color: "#f59e0b"
    },
    { 
      name: "Entry Level", 
      count: 156,
      icon: "🚀",
      color: "#3b82f6"
    },
    { 
      name: "Long-term", 
      count: 234,
      icon: "⏱️",
      color: "#8b5cf6"
    },
  ];

  const steps = [
    { title: "Browse Projects", desc: "Explore available projects in your field", icon: "🔍" },
    { title: "Read Requirements", desc: "Carefully review project specifications", icon: "📝" },
    { title: "Prepare Proposal", desc: "Create a compelling application", icon: "✨" },
    { title: "Submit & Wait", desc: "Send your proposal and await response", icon: "📤" },
  ];

  return (
    <div className="page-container">
      <h1>Find Jobs</h1>
      <p className="intro-text">
        Discover exciting projects and opportunities that match your skills. 
        Start your freelancing journey today!
      </p>

      <div className="content-section">
        <h2>Job Categories</h2>
        <div className="features-grid">
          {jobCategories.map((cat, index) => (
            <div key={index} className="feature-card" style={{ cursor: 'pointer' }}>
              <div style={{ 
                fontSize: '3rem', 
                marginBottom: '16px',
                background: `linear-gradient(135deg, ${cat.color}, ${cat.color}80)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                {cat.icon}
              </div>
              <h3>{cat.name}</h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1.1rem',
                fontWeight: '600',
                marginTop: '8px'
              }}>
                {cat.count} Available
              </p>
              <Link 
                to="/browse-apply" 
                style={{ 
                  display: 'inline-block',
                  marginTop: '16px',
                  color: cat.color,
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                View Jobs →
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>How to Apply for Jobs</h2>
        <div className="features-grid">
          {steps.map((step, index) => (
            <div key={index} className="process-card">
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                marginBottom: '16px',
                boxShadow: '0 8px 20px rgba(16, 185, 129, 0.35)'
              }}>
                {step.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ 
        marginTop: '32px',
        padding: '32px',
        background: 'var(--gradient-primary)',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
        color: 'white',
        boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)'
      }}>
        <h3 style={{ fontSize: '1.75rem', marginBottom: '12px', color: 'white' }}>
          Ready to Get Started?
        </h3>
        <p style={{ fontSize: '1.1rem', marginBottom: '24px', opacity: 0.9 }}>
          Browse hundreds of job opportunities and find your next project!
        </p>
        <Link 
          to="/browse-apply" 
          className="btn-modern-primary"
          style={{ 
            display: 'inline-block',
            textDecoration: 'none',
            background: 'white',
            color: '#10b981',
            padding: '14px 32px',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            fontSize: '1rem'
          }}
        >
          Browse All Jobs
        </Link>
      </div>
    </div>
  );
}

export default FindJobs;
