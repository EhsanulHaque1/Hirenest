import "./Pages.css";

function HowItWorks() {
  const forClients = [
    "Post your project",
    "Review freelancer proposals",
    "Chat and negotiate",
    "Track progress",
    "Release payment upon completion",
  ];

  const forFreelancers = [
    "Create your profile",
    "Browse available projects",
    "Submit proposals",
    "Communicate with clients",
    "Deliver quality work",
  ];

  return (
    <div className="page-container">
      <h1>How Hirenest Works</h1>
      <p className="intro-text">
        Learn how Hirenest simplifies the hiring process for clients and
        freelancers.
      </p>

      <div className="content-section">
        <h2>For Clients</h2>
        <div className="process-columns">
          {forClients.map((step, index) => (
            <div key={index} className="process-card">
              <div className="process-step">{index + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>For Freelancers</h2>
        <div className="process-columns">
          {forFreelancers.map((step, index) => (
            <div key={index} className="process-card">
              <div className="process-step">{index + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
