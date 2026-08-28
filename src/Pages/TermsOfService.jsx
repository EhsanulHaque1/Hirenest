import "./Pages.css";

function TermsOfService() {
  return (
    <div className="page-container">
      <h1>Terms of Service</h1>
      <p className="intro-text">
        Review the terms and conditions for using Hirenest.
      </p>

      <div className="content-section">
        <h2>Key Terms & Conditions</h2>
        <div className="terms-text">
          <h3>1. User Responsibilities</h3>
          <p>
            Users are responsible for maintaining accurate account information
            and protecting their login credentials. Users agree to use the
            platform only for lawful purposes.
          </p>

          <h3>2. Intellectual Property</h3>
          <p>
            All work delivered through Hirenest remains the intellectual
            property of the creator unless otherwise specified in the project
            agreement.
          </p>

          <h3>3. Payment Terms</h3>
          <p>
            Payments are held in escrow until project completion. Clients
            release payment after accepting the deliverables. Freelancers
            receive payment within 5 business days.
          </p>

          <h3>4. Dispute Resolution</h3>
          <p>
            Any disputes between parties will be resolved through Hirenest's
            mediation process or binding arbitration.
          </p>

          <h3>5. Account Termination</h3>
          <p>
            Hirenest reserves the right to terminate accounts that violate these
            terms or engage in fraudulent activity.
          </p>

          <h3>6. Liability Disclaimer</h3>
          <p>
            Hirenest is provided "as is" without warranties. We are not liable
            for any indirect or consequential damages.
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
