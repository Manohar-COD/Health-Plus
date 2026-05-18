import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HeartPulse, Mail, Lock } from 'lucide-react';

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState(location?.state?.prefillEmail || '');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card} className="glass-panel animate-fade-in pulse-primary">
        <div style={styles.header}>
          <HeartPulse size={48} color="var(--primary)" />
          <h1 style={styles.title}>Health Plus</h1>
          <p style={styles.subtitle}>Smarter health tracking, powered by AI</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
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
                placeholder="••••••••"
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
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign Up</Link>
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
};

export default Login;
