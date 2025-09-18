import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import apiClient from '../api/axiosConfig';

function VaccinationModal({ open, onClose, pet }) {
  const [vaccinations, setVaccinations] = useState([]);
  const [vaccineName, setVaccineName] = useState('');
  const [dateGiven, setDateGiven] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    // Fetch vaccinations for the selected pet whenever the modal is opened for a pet
    if (open && pet) {
      const fetchVaccinations = async () => {
        try {
          const response = await apiClient.get(`/pets/${pet.id}/vaccinations/`);
          setVaccinations(response.data);
        } catch (error) {
          console.error("Failed to fetch vaccinations:", error);
        }
      };
      fetchVaccinations();
    }
  }, [open, pet]);

  const handleAddVaccination = async (event) => {
    event.preventDefault();
    try {
      const newVaccination = { vaccine_name: vaccineName, date_given: dateGiven, due_date: dueDate };
      const response = await apiClient.post(`/pets/${pet.id}/vaccinations/`, newVaccination);
      setVaccinations([...vaccinations, response.data]);
      // Clear form
      setVaccineName('');
      setDateGiven('');
      setDueDate('');
    } catch (error) {
      console.error("Failed to add vaccination:", error);
      alert("Failed to add vaccination record.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Vaccination Records for {pet?.name}</DialogTitle>
      <DialogContent>
        {/* Form to Add New Vaccination */}
        <Box component="form" onSubmit={handleAddVaccination} sx={{ mt: 2, mb: 4 }}>
          <Typography variant="h6">Add New Record</Typography>
          <TextField fullWidth margin="normal" label="Vaccine Name" value={vaccineName} onChange={(e) => setVaccineName(e.target.value)} required />
          <TextField fullWidth margin="normal" label="Date Given" type="date" value={dateGiven} onChange={(e) => setDateGiven(e.target.value)} InputLabelProps={{ shrink: true }} required />
          <TextField fullWidth margin="normal" label="Next Due Date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} InputLabelProps={{ shrink: true }} required />
          <Button type="submit" variant="contained" sx={{ mt: 1 }}>Add Record</Button>
        </Box>

        {/* List of Existing Vaccinations */}
        <Typography variant="h6">Existing Records</Typography>
        <List>
          {vaccinations.length > 0 ? (
            vaccinations.map((vac) => (
              <ListItem key={vac.id}>
                <ListItemText 
                  primary={vac.vaccine_name} 
                  secondary={`Given: ${vac.date_given} / Due: ${vac.due_date}`} 
                />
              </ListItem>
            ))
          ) : (
            <Typography>No vaccination records found.</Typography>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default VaccinationModal;