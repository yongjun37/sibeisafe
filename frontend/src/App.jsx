import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Offcanvas } from 'react-bootstrap';
import { getItem, removeItem } from './utils/localStorage.js';
import { useState } from 'react';

import UploadForm from './components/UploadForm.jsx';

import logo from './assets/logo.png';
import { MenuIcon } from './components/Icons.jsx';
import Sidebar from './components/Sidebar.jsx';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedPage, setSelectedPage] = useState('myfiles')

  const handleLogout = () => {
    removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <div className="d-flex vh-100 overflow-hidden">
      
      {/* Sidebar that converges into hamburger menu on small screens */}
      <Sidebar 
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}

        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}

        setShowUploadForm={setShowUploadForm}
        handleLogout={handleLogout}
      />

      <div className="main-layout">
        
        {/* Mobile only header */}
        <div className="mobile-header shadow-sm d-md-none">
          <button className="btn border-0 p-0 bg-transparent" onClick={() => setShowSidebar(true)}>
            <MenuIcon />
          </button>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ width: '24px' }} 
            className="ms-3 me-2" />
          <h5 className="mb-0 fw-bold">SibeiSafe</h5>
        </div>

        {/* Main content area*/}
        <div className="main-content-area">
          <Outlet />
        </div>

      </div>

      {/* Upload form */}
      <UploadForm 
        show={showUploadForm} 
        onHide={() => setShowUploadForm(false)}
        onSuccess={() => {
           setShowUploadForm(false);
        }} 
      />
    </div>
  );
}

export default App;