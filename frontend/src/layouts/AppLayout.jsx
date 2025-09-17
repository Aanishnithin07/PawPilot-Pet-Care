import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../components/Navbar';

function AppLayout({ children }) {
  return (
    <Box>
      <Navbar />
      <main>{children}</main>
    </Box>
  );
}

export default AppLayout;