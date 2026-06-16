import baseURL from '../config.js'
import { useNavigate, Link } from 'react-router-dom';
import { setItem, getItem } from '../utils/localStorage.js';

export default function Login() {
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const response = await fetch(baseURL + '/login', {
      method: 'POST',
      body: new FormData(e.target)
    });
    
    if (response.ok) {
      const data = await response.json();
      setItem('jwt_token', data.access_token);
      navigate('/');

    } else {
      const errorData = await response.json();
      alert(`Login failed: ${errorData.error}`);
      
    }
  }
  return (
    <>
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input type='email' 
                 name='email' 
                 placeholder='Email Address'/>
          <input type='password' 
                 name='password' 
                 placeholder='Password'/>
          <button type='submit'>Log In</button>
        </form>
        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
    </>
  );
}