import App from './App.jsx';
import Dashboard from './components/Dashboard.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import PublicDownload from './components/PublicDownload.jsx'
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
			},
			{
				path: "share/:share_id",
				element: <PublicDownload />
			}
		]
	}
];

export default routes;