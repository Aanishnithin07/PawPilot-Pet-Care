import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';

function DashboardPage() {
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const navigate = useNavigate();

  // State for the AI Symptom Checker
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await apiClient.get('/pets/');
        setPets(response.data);
      } catch (error) {
        console.error('Failed to fetch pets:', error);
        navigate('/login');
      }
    };
    fetchPets();
  }, [navigate]);

  const handleAddPet = async (event) => {
    event.preventDefault();
    try {
      const newPet = { name: petName, breed: petBreed, age: parseInt(petAge), weight: parseFloat(petWeight) };
      const response = await apiClient.post('/pets/', newPet);
      setPets([...pets, response.data]);
      setPetName(''); setPetBreed(''); setPetAge(''); setPetWeight('');
    } catch (error) {
      console.error('Failed to add pet:', error);
      alert('Failed to add pet. Please try again.');
    }
  };

  const handleGetDiagnosis = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setDiagnosis('');
    try {
      const response = await apiClient.post('/diagnose/text', { symptoms: symptoms });
      setDiagnosis(response.data.diagnosis);
    } catch (error) {
      console.error('Failed to get diagnosis:', error);
      alert('Failed to get AI diagnosis. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Pets Dashboard
      </Typography>

      {/* AI Symptom Checker Section */}
      <Box component="form" onSubmit={handleGetDiagnosis} sx={{ mb: 4, p: 2, border: '1px solid grey', borderRadius: 2 }}>
        <Typography variant="h6">AI Symptom Checker</Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Describe your pet's symptoms..."
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          required
          sx={{ mt: 2 }}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Get AI Advice</Button>
        {isLoading && <CircularProgress sx={{ display: 'block', mt: 2 }} />}
        {diagnosis && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="h6">Preliminary Advice:</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>{diagnosis}</Typography>
          </Box>
        )}
      </Box>

      {/* Add a New Pet Section */}
      <Box component="form" onSubmit={handleAddPet} sx={{ mb: 4, p: 2, border: '1px solid grey', borderRadius: 2 }}>
        <Typography variant="h6">Add a New Pet</Typography>
        <Grid container spacing={2} sx={{mt: 1}}>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Pet Name" value={petName} onChange={(e) => setPetName(e.target.value)} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Breed" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Age" type="number" value={petAge} onChange={(e) => setPetAge(e.target.value)} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Weight (kg)" type="number" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} required /></Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Pet</Button>
      </Box>

      {/* My Pets Section */}
      <Typography variant="h5" gutterBottom>My Pets</Typography>
      <Grid container spacing={3}>
        {pets.length > 0 ? (
          pets.map((pet) => (
            <Grid item xs={12} md={6} lg={4} key={pet.id}>
              <Card><CardContent>
                <Typography variant="h6">{pet.name}</Typography>
                <Typography color="text.secondary">Breed: {pet.breed}</Typography>
                <Typography color="text.secondary">Age: {pet.age}</Typography>
                <Typography color="text.secondary">Weight: {pet.weight} kg</Typography>
              </CardContent></Card>
            </Grid>
          ))
        ) : (
          <Typography sx={{ ml: 2 }}>You haven't added any pets yet.</Typography>
        )}
      </Grid>
    </Container>
  );
}

export default DashboardPage;