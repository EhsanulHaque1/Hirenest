import "./Pages.css";

function FreelancerSupport() {
  const supportChannels = [
    { name: "Live Chat", availability: "24/7" },
    { name: "Email Support", availability: "Within 2 hours" },
    { name: "Knowledge Base", availability: "Always" },
    { name: "Community Forum", availability: "24/7" },
  ];

  return (
    <div className="page-container">
      <h1>Freelancer Support</h1>
      <p className="intro-text">
        Get help with your freelancer account and projects.
      </p>

      <div className="content-section">
        <h2>Support Channels</h2>
        <div className="support-channels-grid">
          {supportChannels.map((channel, index) => (
            <div key={index} className="support-card">
              <h4>{channel.name}</h4>
              <p>🕐 {channel.availability}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>Common Support Topics</h2>
        <ul className="support-topics">
          <li>📄 Account setup & profile optimization</li>
          <li>💵 Payment & withdrawal issues</li>
          <li>📚 Proposal writing tips</li>
          <li>🔐 Account security & verification</li>
          <li>👤 Client communication guidelines</li>
        </ul>
      </div>
    </div>
  );
}

export default FreelancerSupport;
