import { Routes, Route } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    // The BrowserRouter and ThemeProvider are correctly in your main.jsx file.
    // This App component should only define the routes.
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route 
        path="/" 
        element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        } 
      />
       <Route 
        path="/dashboard" 
        element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        } 
      />
    </Routes>
  );
}

export default App;