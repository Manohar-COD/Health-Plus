import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, User, Mail, Lock } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    setIsSubmitting(true);
    setError('');
    const normalizedEmail = email.trim().toLowerCase();
    const res = await register(name, normalizedEmail, password);
    if (res?.ok) {
      navigate('/');
    } else if (res?.message && res.message.toLowerCase().includes('already')) {
      // If email already exists, offer quick link to login with prefilled email
      setError('An account with this email already exists.');
      // keep email field normalized so user can copy it
      setEmail(normalizedEmail);
    }
    setIsSubmitting(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel animate-fade-in pulse-primary">
        <div style={styles.header}>
          <HeartPulse size={48} color="var(--primary)" />
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Begin your premium health journey today</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={styles.errorBox} role="alert">
              {error} <a href="/login" style={styles.errorLink}>Sign in</a>
            </div>
          )}
          <div className="form-group" style={styles.formGroup}>
            <label className="form-label">Full Name</label>
            <div style={styles.inputContainer}>
              <User size={18} style={styles.icon} />
              <input 
                type="text" 
                className="form-input" 
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="form-group" style={styles.formGroup}>
            <label className="form-label">Email Address</label>
            <div style={styles.inputContainer}>
              <Mail size={18} style={styles.icon} />
              <input 
                type="email" 
                className="form-input" 
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group" style={styles.formGroup}>
            <label className="form-label">Password</label>
            <div style={styles.inputContainer}>
              <Lock size={18} style={styles.icon} />
              <input 
                type="password" 
                className="form-input" 
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.btn}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign In</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    padding: '40px',
    borderRadius: 'var(--radius-lg)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    marginTop: '16px',
    color: '#fff',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    marginTop: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    marginBottom: '0px',
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-secondary)',
  },
  input: {
    paddingLeft: '44px',
  },
  btn: {
    width: '100%',
    marginTop: '10px',
    padding: '12px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '24px',
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
  },
  link: {
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: '600',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.08)',
    border: '1px solid rgba(239,68,68,0.18)',
    color: '#ef4444',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  errorLink: {
    marginLeft: '8px',
    color: 'var(--primary)',
    textDecoration: 'underline',
  },
};

export default Register;
