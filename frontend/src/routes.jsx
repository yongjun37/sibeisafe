import Login from './components/Login.jsx'
import Register from './components/Register.jsx'
import App from './App.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

const routes = [
    {
        path: "/",
        element: <ProtectedRoute>
                     <App />
                 </ProtectedRoute>
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    }
]

export default routes