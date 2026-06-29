import React from 'react';
import { Outlet, Link } from 'react-router-dom';

import '../styles/App.css'
import file_icon from '../assets/file_icon.png'
import { Container } from 'react-bootstrap';

 
export default function AuthPageLayout() {
  return (
    <>
      <div className="auth-page-container">
        {/* Top Left Logo linking to login */}
        <Link to="/" className="auth-header-logo text-decoration-none text-dark">
          <img
            src={file_icon}
            alt='file-icon'
            style={{ width: '28px', height: 'auto' }} 
          />
          <span>SibeiSafe</span>
        </Link>
        
        <main className="w-100 d-flex justify-content-center align-items-center">
          <Outlet />
        </main>
      </div>

      <footer className="w-100 text-center py-4 text-muted" style={{ fontSize: '14px' }}>
        <Container>
          <small>
            <strong>SibeiSafe</strong> is a technical portfolio project built for educational purposes.
              Please do not upload actual sensitive personal, medical, or financial data.
          </small>
        </Container>
      </footer>    
    </>

    
  );
}