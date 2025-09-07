import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Configs from './pages/Configs';
import Submissions from './pages/Submissions';
import WahaStatus from './pages/WahaStatus';
import Login from './pages/Login';
import { apiService } from './services/api';
import toast from 'react-hot-toast';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const apiKey = localStorage.getItem('apiKey');
      if (apiKey) {
        await apiService.healthCheck();
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      localStorage.removeItem('apiKey');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (apiKey: string) => {
    localStorage.setItem('apiKey', apiKey);
    setIsAuthenticated(true);
    toast.success('Login realizado com sucesso!');
  };

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    setIsAuthenticated(false);
    toast.success('Logout realizado com sucesso!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/configs" element={<Configs />} />
        <Route path="/submissions" element={<Submissions />} />
        <Route path="/waha" element={<WahaStatus />} />
      </Routes>
    </Layout>
  );
}

export default App;
