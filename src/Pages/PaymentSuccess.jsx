import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "./Pages.css";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const tranId = searchParams.get('tran_id');
  const jobTitle = searchParams.get('job_title');

  useEffect(() => {
    setLoading(false);
  }, [tranId]);

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h1>Processing Payment...</h1>
        </div>
      </div>
    );
  }

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
          background: 'var(--primary-green)', 
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          fontSize: '40px',
          color: 'white'
        }}>
          ✓
        </div>
        
        <h1 style={{ 
          color: 'var(--primary-green)', 
          marginBottom: '16px',
          fontSize: '2rem'
        }}>
          Payment Successful!
        </h1>
        
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '24px',
          fontSize: '1.1rem'
        }}>
          Your job has been posted successfully!
        </p>

        {tranId && (
          <div style={{
            background: 'var(--bg-primary)',
            padding: '12px 20px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            fontSize: '0.9rem'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>Transaction ID: </span>
            <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>{tranId}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-modern-primary"
            style={{ padding: '12px 32px' }}
          >
            Go to Dashboard
          </button>
          <Link to="/post-job">
            <button
              className="btn-modern-secondary"
              style={{ padding: '12px 32px' }}
            >
              Post Another Job
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
