import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "./Pages.css";

function PaymentFail() {
  const [searchParams] = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMessage(error);
    }
  }, [searchParams]);

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
          background: '#ef4444', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '40px',
          color: 'white'
        }}>
          ✕
        </div>
        
        <h1 style={{ 
          color: '#ef4444', 
          marginBottom: '16px',
          fontSize: '2rem'
        }}>
          Payment Failed
        </h1>
        
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '24px',
          fontSize: '1.1rem'
        }}>
          {errorMessage || 'Your payment could not be processed. Please try again.'}
        </p>

        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          padding: '16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ margin: 0 }}>
            💡 <strong>Don't worry!</strong> Your job posting was not created. 
            No money has been deducted from your account.
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

export default PaymentFail;
