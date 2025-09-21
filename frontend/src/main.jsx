import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { LanguageProvider } from './context/LanguageContext.jsx'; // Import LanguageProvider

// Define a dark theme
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#61dafb', // A light blue for primary elements
    },
    secondary: {
      main: '#FF4081', // A vibrant pink for secondary actions
    },
    background: {
      default: '#121212', // Dark background
      paper: '#1d1d1d',   // Slightly lighter dark for cards/paper
    },
    text: {
      primary: '#ffffff', // White text
      secondary: '#b0b0b0', // Light grey secondary text
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8, // Slightly rounded buttons
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12, // More rounded cards
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1d1d1d', // Darker AppBar
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider> {/* Wrap the entire app with LanguageProvider */}
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </LanguageProvider>
  </React.StrictMode>,
);