import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Configs from './pages/Configs';
import Submissions from './pages/Submissions';
import WahaStatus from './pages/WahaStatus';

function App() {
  const handleLogout = () => {
    // Logout não faz nada em modo desenvolvimento
    console.log('Logout - modo desenvolvimento');
  };

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
