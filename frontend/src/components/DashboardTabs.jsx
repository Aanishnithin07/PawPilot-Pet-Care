import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

// Ensure all props are present here
function DashboardTabs({ petListComponent, symptomCheckerComponent, vetLocatorComponent, vetCommunityComponent, nutritionComponent }) {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="dashboard tabs" centered>
          <Tab label="My Pets" />
          <Tab label="AI Symptom Checker" />
          <Tab label="Vet Locator" />
          <Tab label="Talk to a Vet" />
          <Tab label="Wellness & Nutrition" /> {/* <--- Make sure this Tab is present */}
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
      <TabPanel value={value} index={3}>
        {vetCommunityComponent}
      </TabPanel>
      <TabPanel value={value} index={4}> {/* <--- Make sure this TabPanel is present with index={4} */}
        {nutritionComponent}
      </TabPanel>
    </Box>
  );
}

export default DashboardTabs;