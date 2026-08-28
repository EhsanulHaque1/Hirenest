import "./Reviews.css";

function Reviews() {
  return (
    <div className="reviews-unique-root">
      
      <header className="reviews-top-banner">
        <h1>Ratings & Reviews</h1>
        <p>
          HireNest builds trust through a transparent rating system. 
          After project completion, clients provide feedback to ensure accountability 
          and quality.
        </p>
      </header>

      <main className="reviews-bottom-content">
        
        <div className="reviews-intro-box">
          <h2>Reliability & Standards</h2>
          <p>
            Our system motivates freelancers to maintain high professional standards. 
            Future clients can evaluate reliability before hiring, making the marketplace 
            safer for everyone.
          </p>
        </div>

        <div className="reviews-features-grid">
          <div className="rev-card">
            <div className="rev-card-icon">⭐</div>
            <h3>Performance Feedback</h3>
            <p>Clients rate freelancers immediately after a job is finished.</p>
          </div>

          <div className="rev-card">
            <div className="rev-card-icon">📝</div>
            <h3>Written Reviews</h3>
            <p>Detailed feedback is stored and displayed on user profiles.</p>
          </div>

          <div className="rev-card">
            <div className="rev-card-icon">📊</div>
            <h3>Average Scores</h3>
            <p>The system automatically calculates average ratings for transparency.</p>
          </div>
        </div>

        <div className="reviews-trust-footer">
          <p>
            <strong>Benefit:</strong> High-rated freelancers gain more visibility, 
            while clients hire with total confidence.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Reviews;