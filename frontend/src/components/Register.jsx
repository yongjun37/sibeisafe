import baseURL from '../config.js'
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();

    const response = await fetch(baseURL + '/register', {
      method: 'POST',
      body: new FormData(e.target)
    });
    
    if (response.ok) {
      navigate('/login');
      
    } else {
      const errorData = await response.json();
      alert(`Register failed: ${errorData.error}`);
    
    }
  }

  return (
    <>
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input type='email' 
                 name='email' 
                 placeholder='Email Address'/>
          <input type='password' 
                 name='password' 
                 placeholder='Password'/>
          <button type='submit'>Create Account</button>
        </form>
    </>
  );
}