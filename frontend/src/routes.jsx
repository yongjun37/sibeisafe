import App from './App.jsx';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const routes = [
    {
        path: "/",
        element: <App />,
        children: [
            {
                index: true,
                element: (
                    <ProtectedRoute>
                        <Dashboard />
                    </ProtectedRoute>
                )
            },
            {
                path: "login",
                element: <Login />
            },
            {
                path: "register",
                element: <Register />
            }
        ]
    }
];

export default routes;