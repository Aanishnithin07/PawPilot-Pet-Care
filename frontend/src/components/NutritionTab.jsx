import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Grid, Paper, CircularProgress, Alert } from '@mui/material';
import apiClient from '../api/axiosConfig';

function NutritionTab() {
  const [breed, setBreed] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [nutritionAdvice, setNutritionAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetNutritionAdvice = async () => {
    if (!breed || !weight || !age) {
      setError('Please fill in all fields to get nutrition advice.');
      return;
    }
    setError('');
    setIsLoading(true);
    setNutritionAdvice('');
    try {
      const response = await apiClient.post('/diagnose/nutrition-analysis', {
        breed: breed,
        weight_kg: parseFloat(weight),
        age_years: parseInt(age),
      });
      setNutritionAdvice(response.data.nutrition_advice);
    } catch (err) {
      console.error('Failed to get nutrition analysis:', err);
      setError('Failed to fetch nutrition advice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        PawPilot Wellness & Nutrition
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Get personalized diet recommendations tailored for your pet's specific needs.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Your Pet's Nutrition Profile</Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}>
            <TextField 
              fullWidth 
              label="Pet Breed" 
              value={breed} 
              onChange={(e) => setBreed(e.target.value)} 
              required 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField 
              fullWidth 
              label="Weight (kg)" 
              type="number" 
              value={weight} 
              onChange={(e) => setWeight(e.target.value)} 
              required 
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField 
              fullWidth 
              label="Age (years)" 
              type="number" 
              value={age} 
              onChange={(e) => setAge(e.target.value)} 
              required 
            />
          </Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button 
          variant="contained" 
          sx={{ mt: 3 }} 
          onClick={handleGetNutritionAdvice} 
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Get Personalized Diet Plan'}
        </Button>
      </Paper>

      {nutritionAdvice && (
        <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h6" gutterBottom>Your Pet's Personalized Diet Plan</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{nutritionAdvice}</Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            Always consult with a professional veterinarian or pet nutritionist for a comprehensive and tailored diet plan.
          </Alert>
        </Paper>
      )}

      <Box sx={{ mt: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>General Nutrition Tips for Pet Parents</Typography>
        <Typography variant="body2" color="text.secondary">
          - **Quality Ingredients:** Look for pet foods with real meat, vegetables, and whole grains. Avoid excessive fillers and artificial additives. <br/>
          - **Portion Control:** Follow feeding guidelines based on your pet's age, weight, and activity level to prevent obesity. <br/>
          - **Fresh Water:** Ensure constant access to clean, fresh water. <br/>
          - **Regular Vet Check-ups:** Discuss your pet's diet with your vet during routine visits to ensure it meets their evolving needs. <br/>
          - **Treats in Moderation:** Treats should make up no more than 10% of your pet's daily caloric intake.
        </Typography>
      </Box>

    </Box>
  );
}

export default NutritionTab;