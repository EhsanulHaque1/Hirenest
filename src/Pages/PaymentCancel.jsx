import { Link } from "react-router-dom";
import "./Pages.css";

function PaymentCancel() {
  return (
    <div className="page-container">
      <div style={{ 
        maxWidth: '500px', 
        margin: '60px auto', 
        padding: '40px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-xl)',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
      }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: '#f59e0b', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '40px',
          color: 'white'
        }}>
          !
        </div>
        
        <h1 style={{ 
          color: '#f59e0b', 
          marginBottom: '16px',
          fontSize: '2rem'
        }}>
          Payment Cancelled
        </h1>
        
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '24px',
          fontSize: '1.1rem'
        }}>
          You cancelled the payment process. Your job posting was not created.
        </p>

        <div style={{
          background: 'var(--bg-primary)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ margin: 0 }}>
            💡 No money has been deducted from your account. 
            You can try posting your job again whenever you're ready.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/post-job">
            <button
              className="btn-modern-primary"
              style={{ padding: '12px 32px' }}
            >
              Try Again
            </button>
          </Link>
          <Link to="/">
            <button
              className="btn-modern-secondary"
              style={{ padding: '12px 32px' }}
            >
              Go Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentCancel;
