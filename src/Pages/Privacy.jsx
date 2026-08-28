import "./Pages.css";

function PrivacyPolicy() {
  return (
    <div className="page-container">
      <h1>Privacy Policy</h1>
      <p className="intro-text">
        Hirenest is committed to protecting your privacy and personal
        information.
      </p>

      <div className="content-section">
        <h2>Our Privacy Commitment</h2>
        <div className="policy-text">
          <h3>Data Collection</h3>
          <p>
            We collect information to provide and improve our services,
            including your profile data, project information, and
            communications.
          </p>

          <h3>Data Protection</h3>
          <p>
            Your data is encrypted and secured using industry-standard security
            measures. We never share your personal information with third
            parties without consent.
          </p>

          <h3>Your Rights</h3>
          <ul>
            <li>Access your personal data anytime</li>
            <li>Request corrections or deletions</li>
            <li>Opt-out of promotional emails</li>
            <li>Port your data to other services</li>
          </ul>

          <h3>Contact Us</h3>
          <p>For privacy questions, email us at privacy@hirenest.com</p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
