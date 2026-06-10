import { createBrowserRouter, RouterProvider } from "react-router";
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import routes from './routes.jsx'
import './styles/index.css'

const router = createBrowserRouter(routes)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
