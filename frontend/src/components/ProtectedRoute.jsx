import { Navigate } from 'react-router-dom';
import { getItem } from '../utils/localStorage.js'

export default function ProtectedRoute({ children }) {
    return getItem('jwt_token') == undefined 
    ? <Navigate to='/login'/>
    : <>{children}</>
}