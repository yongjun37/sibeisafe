import React from 'react';
import { Outlet, Link } from 'react-router-dom';

import '../styles/App.css'
import logo from '../assets/logo.png'
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';

 
export default function AuthPageLayout() {
  return (
    <div className='auth-layout'>
      <Navbar className="bg-transparent pt-3">
          <Container fluid className="px-5">
            <Navbar.Brand 
              as={Link} to="/" 
              className="d-flex align-items-center gap-2 fw-bold fs-4"
            >
              <img src={logo} alt='sibeisafe-logo' style={{ width: '32px', height: 'auto' }}/>
              SibeiSafe
            </Navbar.Brand>
          </Container>
      </Navbar>

      <main className="auth-main-content">
        <Outlet />
      </main>

      <footer className="auth-footer" style={{ fontSize: '14px' }}>
        <Container>
          <small>
            <strong>SibeiSafe</strong> is a technical portfolio project built for educational purposes.
              Please do not upload actual sensitive personal, medical, or financial data.
          </small>
        </Container>
      </footer>    
    </ div>
  );
}