import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Grid, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig'; // Import our new API client

function DashboardPage() {
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const navigate = useNavigate();

  // This useEffect will run once when the page loads
  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await apiClient.get('/pets/');
        setPets(response.data);
      } catch (error) {
        console.error('Failed to fetch pets:', error);
        // If the token is invalid or expired, redirect to login
        navigate('/login');
      }
    };

    fetchPets();
  }, [navigate]);

  const handleAddPet = async (event) => {
    event.preventDefault();
    try {
      const newPet = {
        name: petName,
        breed: petBreed,
        age: parseInt(petAge),
        weight: parseFloat(petWeight),
      };
      const response = await apiClient.post('/pets/', newPet);
      // Add the new pet to our list to update the UI instantly
      setPets([...pets, response.data]);
      // Clear the form fields
      setPetName('');
      setPetBreed('');
      setPetAge('');
      setPetWeight('');
    } catch (error) {
      console.error('Failed to add pet:', error);
      alert('Failed to add pet. Please try again.');
    }
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Pets Dashboard
      </Typography>

      {/* Section to Add a New Pet */}
      <Box component="form" onSubmit={handleAddPet} sx={{ mb: 4, p: 2, border: '1px solid grey', borderRadius: 2 }}>
        <Typography variant="h6">Add a New Pet</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Pet Name" value={petName} onChange={(e) => setPetName(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Breed" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Age" type="number" value={petAge} onChange={(e) => setPetAge(e.target.value)} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Weight (kg)" type="number" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} required />
          </Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Pet</Button>
      </Box>

      {/* Section to Display Pets */}
      <Typography variant="h5" gutterBottom>My Pets</Typography>
      <Grid container spacing={3}>
        {pets.length > 0 ? (
          pets.map((pet) => (
            <Grid item xs={12} md={6} lg={4} key={pet.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{pet.name}</Typography>
                  <Typography color="text.secondary">Breed: {pet.breed}</Typography>
                  <Typography color="text.secondary">Age: {pet.age}</Typography>
                  <Typography color="text.secondary">Weight: {pet.weight} kg</Typography>
                </CardContent>
              </Card>
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