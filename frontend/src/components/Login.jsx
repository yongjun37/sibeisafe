import { useNavigate, Link, useLocation } from 'react-router-dom';
import { setItem, getItem } from '../utils/localStorage.js';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';

import baseURL from '../config.js'

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const errorTimerRef = useRef(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accountCreated, setAccountCreated] = useState(location.state?.message || null);

  useEffect(() => {
    if (accountCreated) {
      const timer = setTimeout(() => {
        setAccountCreated(null);
        navigate(location.pathname, { replace: true, state: {} });
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [accountCreated, navigate, location.pathname]);

  const displayError = (msg) => {
    setError(msg);
    // If a timer is already running, kill it immediately
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    // Start a brand new 10-second timer
    errorTimerRef.current = setTimeout(() => {
      setError(null);
    }, 10000);
  };

  async function handleLogin(e) {
    e.preventDefault();

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);

    try {
      const response = await fetch(baseURL + '/login', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        setItem('jwt_token', data.access_token);
        navigate('/');

      } else {
        const errorData = await response.json();
        displayError(errorData.error);
        
      }
    } catch (error) {
      displayError('Failed to communicate with server. Please try again later');

    } finally {
      setIsLoading(false);
      setPassword('');

    }
    
  }
  return (
    <div className='login-card shadow bg-white p-5 d-flex flex-column justify-content-start'>
      <h2 className="fw-bolder">Sign In</h2>
      <p className="text-muted">To continue to SibeiSafe</p>
      {error && <Alert variant="danger">{error}</Alert>}
      {accountCreated && <Alert variant="success">{accountCreated}</Alert>}
      <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
        <div className="d-flex flex-column">
          <label className="fw-bold fs-6 mb-1 text-dark">Email:</label>
          <input 
            type="email" 
            className="form-control"
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            disabled={isLoading}
            required 
          />
        </div>
        
        <div className="d-flex flex-column mb-3">
          <label className="fw-bold fs-6 mb-1 text-dark">Password:</label>
          <input 
            type="password" 
            className="form-control"
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            disabled={isLoading}
            required 
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn w-100 py-2 mt-2 fw-bold"
          disabled={isLoading}>
          {isLoading ? 'Logging In...' : 'Sign In'}
        </button>
      </form>
      <br/>
      <p className="text-muted text-center fs-6">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}