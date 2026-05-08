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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element = {<Layout />}>
      <Route path = '/' element = {<LandingPage />} />
      <Route path = '/app' element = {<AppPage />} />
      <Route path = '/dashboard' element = {<Dashboard />} />
      <Route path = '/auth' element = {<AuthenticationPage />} />
      <Route path = '/history' element = {<History />} />
      <Route path = '/troubles' element = {<Troubles />} />
    </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router} />
  </StrictMode>,
)
