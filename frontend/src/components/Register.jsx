import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Alert } from 'react-bootstrap';

import baseURL from '../config.js'
import logo from '../assets/logo.png'

export default function Register() {
  const navigate = useNavigate();
  const errorTimerRef = useRef(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const displayError = (msg) => {
    setError(msg);
    // If a timer is already running, kill it immediately
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    // Start a brand new 10-second timer
    errorTimerRef.current = setTimeout(() => {
      setError(null);
    }, 10000);
  };

  async function handleRegister(e) {
    e.preventDefault();

    if (password != confirmPassword) {
      displayError("Passwords do not match!");
      return;
    }

    setIsLoading(true);
    displayError(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    try {
      const response = await fetch(baseURL + '/register', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        navigate('/login', { 
          state: { message: "Account created successfully! Please log in." } 
        }); 
      
      } else {
        const errorData = await response.json();
        displayError(errorData.error);
      
      }
    } catch (error) {
      displayError('Failed to communicate with server. Please try again later');

    } finally {
      setIsLoading(false);

    }
  }

  return (
    <div className="register-card shadow">
      <div className="register-left text-center d-flex flex-column justify-content-center align-items-center ">
        <img 
          src={logo} 
          alt="sibeisafe-logo" 
          className="mb-2" 
          style={{ width: '64px', height: 'auto' }} 
        />
        <h2 className="fw-bolder mb-4">SibeiSafe</h2>
        <h3 className="fs-4 fw-normal mb-2">Create Your Account</h3>
        <p className="text-muted fs-6">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div className="register-divider d-none d-md-block"></div>

      <div className="register-right d-flex flex-column justify-content-center">
        {error && <Alert variant="danger">{error}</Alert>}
        <form onSubmit={handleRegister} className="d-flex flex-column gap-3">
          
          <div className="d-flex flex-column">
            <label className="form-label">Email:</label>
            <input 
              type="email" 
              className="form-control"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              disabled={isLoading}
              required 
            />
          </div>
          
          <div className="d-flex flex-column">
            <label className="form-label">Password:</label>
            <input 
              type="password" 
              className="form-control"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              disabled={isLoading}
              required 
            />
          </div>
          
          <div className="d-flex flex-column mb-3">
            <label className="form-label">Confirm Password:</label>
            <input 
              type="password" 
              className="form-control"
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              disabled={isLoading}
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn w-100 py-2 mt-2 fw-bold"
            disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>

        </form>
      </div>
    </div>
  );
}