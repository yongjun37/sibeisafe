import { Outlet, useNavigate } from 'react-router-dom';
import { Button, Offcanvas } from 'react-bootstrap';

import logo from '../assets/logo.png';
import { FilesIcon, 
         SharedIcon, 
         SharedWithMeIcon, 
         TrashIcon,
         PlusIcon
      } from './Icons.jsx';


export default function Sidebar({ showSidebar, setShowSidebar, selectedPage, setSelectedPage, handleLogout, setShowUploadForm}) {
  const navigate = useNavigate();
  return (
    <Offcanvas 
      show={showSidebar} 
      onHide={() => setShowSidebar(false)} 
      responsive="md"
      className='d-flex flex-column sibeisafe-sidebar'
      data-bs-theme="dark"
    >
      <Offcanvas.Header closeButton>
        <img src={logo} alt="Logo" style={{ width: '28px', height: 'auto' }} />
        <Offcanvas.Title className='ms-2'>SibeiSafe</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="d-flex flex-column"> 
        <button 
          className='upload-btn'
          onClick={() => setShowUploadForm(true)}
          disabled={selectedPage !== 'myfiles'}
        >
          <div className='d-flex align-items-center gap-2'>
            <PlusIcon />
            New Files
          </div>
        </button>
        
        <div className="d-flex flex-column w-100">
          <Button 
            variant="transparent" 
            className={`page-btn page-btn${selectedPage === "myfiles" && '-selected'}`}
            onClick={() => {
              navigate('/');
              setSelectedPage('myfiles');
            }}
          >
            <div className='d-flex align-items-center gap-2'>
              <FilesIcon />
              My Files
            </div>
          </Button>
          
          <Button 
            variant="transparent" 
            className={`page-btn ${selectedPage === "shared" && 'page-btn-selected'}`}
            onClick={() => {
              navigate('/');
              setSelectedPage('shared');
            }}>
            <div className='d-flex align-items-center gap-2'>
              <SharedIcon />
              Shared
            </div>
          </Button>
          
          <Button 
            variant="transparent" 
            className={`page-btn ${selectedPage === "sharedwithme" && 'page-btn-selected'}`}
            onClick={() => {
              navigate('/');
              setSelectedPage('sharedwithme');
            }}>
            <div className='d-flex align-items-center gap-2'>
              <SharedWithMeIcon />
              Shared with me
            </div>
          </Button>
          
          <hr />
          
          <Button 
            variant="transparent" 
            className={`page-btn ${selectedPage === "trash" && 'page-btn-selected'}`}
            onClick={() => {
              navigate('/');
              setSelectedPage('trash');
            }}>
            <div className='d-flex align-items-center gap-2'>
              <TrashIcon />
              Trash
            </div>
          </Button>
        </div>

        <div className="mt-auto pt-3">
            <Button variant="outline-secondary" className="w-100 text-white border-secondary opacity-75" onClick={handleLogout}>
              Log Out
            </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  )
}