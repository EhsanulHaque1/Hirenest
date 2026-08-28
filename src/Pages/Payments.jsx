import "./Payments.css";

function Payments() {
  return (
    <div className="payments-layout-root">
      
      <div className="payments-header-block">
        <h1 className="payments-main-title">Secure Payment System</h1>
        <p className="payments-intro-text">
          The Secure Payment system in HireNest ensures that financial
          transactions between clients and freelancers are conducted safely
          and transparently.
        </p>
      </div>

      <div className="payments-content-body">
        
        <section className="escrow-info-box">
          <h2>Escrow Payment Model</h2>
          <p>
            In an escrow payment system, the client deposits the agreed project
            payment into the platform before work begins. The funds are securely
            held by the system until the project is completed and approved.
          </p>
          <div className="escrow-visual-line">
            <span className="node">Deposit</span>
            <span className="arrow">→</span>
            <span className="node">Work</span>
            <span className="arrow">→</span>
            <span className="node">Release</span>
          </div>
        </section>

        <section className="payment-features-list">
          <h2>Key Features & Advantages</h2>
          <div className="features-grid-container">
            <div className="feature-card-item">
              <strong>Secure Gateway</strong>
              <p>Integration with trusted payment providers for safe transactions.</p>
            </div>
            <div className="feature-card-item">
              <strong>Transaction History</strong>
              <p>Full tracking and invoice generation for every project.</p>
            </div>
            <div className="feature-card-item">
              <strong>Trust Protection</strong>
              <p>Freelancers are guaranteed payment before starting work.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default Payments;