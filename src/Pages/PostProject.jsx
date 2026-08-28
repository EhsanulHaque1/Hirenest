import "./Pages.css";

function PostProject() {
  const steps = [
    "Create a detailed project description",
    "Set your budget and timeline",
    "Receive bids from freelancers",
    "Review profiles and portfolios",
    "Select and hire your ideal freelancer",
  ];

  return (
    <div className="page-container">
      <h1>Post a Project</h1>
      <p className="intro-text">
        Share your project details and connect with freelancers ready to work.
      </p>

      <div className="content-section">
        <h2>How to Post a Project</h2>
        <div className="steps-list">
          {steps.map((step, index) => (
            <div key={index} className="step-item">
              <div className="step-number">{index + 1}</div>
              <p>{step}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="content-section">
        <h2>Project Categories</h2>
        <div className="categories-grid">
          {[
            "Web Development",
            "Mobile App",
            "Design",
            "Writing",
            "Marketing",
            "Business",
          ].map((cat, idx) => (
            <div key={idx} className="category-badge">
              {cat}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PostProject;
