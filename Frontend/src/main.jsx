import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import LandingPage from './Pages/LandingPage.jsx'
import AppPage from './Pages/app/UpdatedAppPage.jsx'
import AuthenticationPage from './Pages/AuthenticationPage.jsx'
import Dashboard from './Pages/Dashboard.jsx'
import Troubles from './Pages/Troubles.jsx'
import History from './Pages/History.jsx'
import Settings from './Pages/Settings.jsx'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route index element={<LandingPage />} />
      <Route path='app' element={<AppPage />} />
      <Route path='dashboard' element={<Dashboard />} />
      <Route path='auth' element={<AuthenticationPage />} />
      <Route path='history' element={<History />} />
      <Route path='settings' element={<Settings />} />
      <Route path='troubles' element={<Troubles />} />
      <Route path='*' element={<Troubles />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
