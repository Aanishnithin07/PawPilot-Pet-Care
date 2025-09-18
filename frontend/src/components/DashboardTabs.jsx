import React, { useState } from 'react';
import { Tabs, Tab, Box, Typography } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function DashboardTabs({ petListComponent, symptomCheckerComponent, vetLocatorComponent }) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="dashboard tabs">
          <Tab label="My Pets" />
          <Tab label="AI Symptom Checker" />
          <Tab label="Vet Locator" />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        {petListComponent}
      </TabPanel>
      <TabPanel value={value} index={1}>
        {symptomCheckerComponent}
      </TabPanel>
      <TabPanel value={value} index={2}>
        {vetLocatorComponent}
      </TabPanel>
    </Box>
  );
}

export default DashboardTabs;