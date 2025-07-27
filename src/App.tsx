import React from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { HomePage } from './pages/HomePage'
import { ViewPage } from './pages/ViewPage'
import { AdminPanel } from './components/AdminPanel'

const ViewPageWrapper: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  if (!id) return <Navigate to="/" replace />
  return <ViewPage ebookId={id} />
}

const AppContent: React.FC = () => {
  const handleViewEbook = (id: string) => {
    window.location.href = `/view/${id}`
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage onViewEbook={handleViewEbook} />} />
      <Route path="/view/:id" element={<ViewPageWrapper />} />
      <Route path="/admin" element={<AdminPanel />} />
    </Routes>
  )
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <AppContent />
      </Router>
    </LanguageProvider>
  )
}

export default App