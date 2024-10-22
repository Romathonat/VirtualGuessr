import React, { useState } from 'react';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <div className="newsletter-signup">
      <form onSubmit={handleSubmit} className="newsletter-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Mail"
          required
          className="email-input"
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: '#9B2E2E',
            color: 'white',
            borderRadius: '5px',
          }}
        >
          {loading ? 'Subscribing...' : "Be part of this journey"}
        </button>
      </form>
      {status === 'success' && (
        <div className="alert success">
          Thanks for subscribing ! Check your mails for confirmation
        </div>
      )}
      {status === 'error' && (
        <div className="alert error">
          An error occured.
        </div>
      )}
      <style jsx>{`
        .newsletter-signup {
          font-family: Arial, sans-serif;
        }
        .newsletter-form {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .email-input {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        .submit-button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .alert {
          margin-top: 10px;
          padding: 10px;
          border-radius: 4px;
        }
        .success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      `}</style>
    </div>
  );
};

export default NewsletterSignup;