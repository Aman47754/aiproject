import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx'
import AboutUs from './pages/AboutUs.jsx'
import Analytics from './pages/Analytics.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/owner" element={<OwnerDashboard />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
