import React from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, Navigate } from 'react-router-dom'
import { LanguageProvider } from './contexts/LanguageContext'
import { HomePage } from './pages/HomePage'
import { ViewPage } from './pages/ViewPage'
import { AdminPanel } from './components/AdminPanel'
import LoginPage from './pages/LoginPage'
import { supabase } from './lib/supabase'
import { User } from '@supabase/supabase-js'

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
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminRoute />} />
    </Routes>
  )
}

const AdminRoute: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <p>Loading...</p>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AdminPanel />;
};

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
