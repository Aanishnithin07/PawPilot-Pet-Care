import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import LanguageSwitcher from './LanguageSwitcher'; // Import LanguageSwitcher
import { useLanguage } from '../context/LanguageContext'; // Import useLanguage hook

function Navbar() {
  const navigate = useNavigate();
  const { t } = useLanguage(); // Use the translation hook

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('language'); // Also clear language preference on logout
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      alert(t('errorLogout')); // Use translated alert
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('appTitle')} {/* Use translation */}
        </Typography>
        <LanguageSwitcher /> {/* Add the language switcher */}
        <Button color="inherit" onClick={handleLogout}>
          {t('logout')} {/* Use translation */}
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;