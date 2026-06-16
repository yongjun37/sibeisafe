import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Container, Navbar, Button } from 'react-bootstrap';
import { getItem, removeItem } from './utils/localStorage.js';
import { useEffect } from 'react';

function App() {
  const navigate = useNavigate();
  const jwt_token = getItem('jwt_token');
  const isAuthenticated = !!jwt_token

  const handleLogout = () => {
    removeItem('jwt_token');
    navigate('/login');
  };

  return (
    <>
      {/* Standard Navbar on all pages */}
      <Navbar bg="dark" variant="dark" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/">SibeiSafe</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav"/>
          <Navbar.Collapse className="justify-content-end">
            {isAuthenticated && (
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Log Out
              </Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {/* Pages displayed here */}
        <Outlet />
      </Container>
    </>
  );
}

export default App