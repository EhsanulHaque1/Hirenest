import "./Pages.css";

function Marketing() {
  const specialties = [
    { name: "Digital Marketing", description: "SEO, SEM, Social Media" },
    { name: "Content Marketing", description: "Blogs, Videos, Copywriting" },
    { name: "Email Marketing", description: "Campaigns & Automation" },
    { name: "Analytics", description: "Data-driven strategies" },
  ];

  return (
    <div className="page-container">
      <h1>Marketing</h1>
      <p className="intro-text">
        Connect with marketing professionals to grow your business online.
      </p>

      <div className="content-section">
        <h2>Marketing Specialties</h2>
        <div className="specialties-grid">
          {specialties.map((spec, index) => (
            <div key={index} className="specialty-card">
              <h4>{spec.name}</h4>
              <p>{spec.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>What Our Experts Can Do</h2>
        <ul className="benefits-list">
          <li>✓ Increase brand awareness and visibility</li>
          <li>✓ Drive qualified traffic to your website</li>
          <li>✓ Improve conversion rates and ROI</li>
          <li>✓ Build loyal customer communities</li>
        </ul>
      </div>
    </div>
  );
}

export default Marketing;
