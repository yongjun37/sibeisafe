import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button, Offcanvas } from 'react-bootstrap';
import { getItem, removeItem } from './utils/localStorage.js';
import { useState, useEffect } from 'react';
import baseURL from "./config";

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
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function getFiles() {
    try {
      setIsLoading(true);
      const response = await fetch(`${baseURL}/files`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${getItem('jwt_token')}` }
      });
      const data = await response.json();
      if (!response.ok) {
        alert(`File fetch failed: ${data.error}`);
        return [];
      }
      setFiles(data);
      return data;
    } catch (error) {
      console.error("Network error:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
      getFiles();
    }, []);

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
          <Outlet context={{ files, 
                             isLoading, 
                             getFiles,
                             setShowUploadForm }}/>
        </div>

      </div>

      {/* Upload form */}
      <UploadForm 
        show={showUploadForm} 
        onHide={() => setShowUploadForm(false)}
        onSuccess={() => {
           setShowUploadForm(false);
           getFiles();
        }} 
      />
    </div>
  );
}

export default App;