import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, TextField, Button, Grid, Card, CardContent, CircularProgress, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import VetLocator from '../components/VetLocator';
import DashboardTabs from '../components/DashboardTabs';

function DashboardPage() {
  // ... (all your existing state for pets, etc. stays the same)
  const [pets, setPets] = useState([]);
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const navigate = useNavigate();

  // State for Text AI
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);

  // --- NEW STATE FOR IMAGE AI ---
  const [imageFile, setImageFile] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);


  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await apiClient.get('/pets/');
        setPets(response.data);
      } catch (error) { console.error('Failed to fetch pets:', error); navigate('/login'); }
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
    } catch (error) { console.error('Failed to add pet:', error); alert('Failed to add pet. Please try again.'); }
  };

  const handleGetDiagnosis = async (event) => {
    event.preventDefault();
    setIsLoadingText(true); setDiagnosis('');
    try {
      const response = await apiClient.post('/diagnose/text', { symptoms: symptoms });
      setDiagnosis(response.data.diagnosis);
    } catch (error) { console.error('Failed to get diagnosis:', error); alert('Failed to get AI diagnosis. Please try again.'); }
    setIsLoadingText(false);
  };

  // --- NEW HANDLER FOR IMAGE UPLOAD ---
  const handleImageAnalysis = async () => {
    if (!imageFile) return alert('Please select an image file first.');
    setIsLoadingImage(true); setImageResult(null);
    
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await apiClient.post('/diagnose/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageResult(response.data);
    } catch (error) {
      console.error('Failed to analyze image:', error);
      alert('Failed to analyze image. Please try again.');
    }
    setIsLoadingImage(false);
  };

  
  const myPetsComponent = (
    <Box component="form" onSubmit={handleAddPet} sx={{ mb: 4 }}>
      <Typography variant="h6">Add a New Pet</Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Pet Name"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Breed"
            value={petBreed}
            onChange={(e) => setPetBreed(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Age"
            type="number"
            value={petAge}
            onChange={(e) => setPetAge(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Weight (kg)"
            type="number"
            value={petWeight}
            onChange={(e) => setPetWeight(e.target.value)}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained">
            Add Pet
          </Button>
        </Grid>
      </Grid>
      <Divider sx={{ my: 4 }} />
      <Typography variant="h6" sx={{ mt: 2 }}>My Pets</Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {pets.map((pet) => (
          <Grid item xs={12} sm={6} md={4} key={pet.id}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1">{pet.name}</Typography>
                <Typography variant="body2">Breed: {pet.breed}</Typography>
                <Typography variant="body2">Age: {pet.age}</Typography>
                <Typography variant="body2">Weight: {pet.weight} kg</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const symptomCheckerComponent = (
    <Box>
      {/* Text Symptom Checker */}
      <Box component="form" onSubmit={handleGetDiagnosis} sx={{ mb: 4 }}>
        <Typography variant="h6">AI Symptom Checker (Text)</Typography>
        <TextField fullWidth multiline rows={4} label="Describe your pet's symptoms..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required sx={{ mt: 2 }} />
        <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isLoadingText}>
          {isLoadingText ? <CircularProgress size={24} /> : 'Get AI Advice'}
        </Button>
        {diagnosis && (
          <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6">Preliminary Advice:</Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{diagnosis}</Typography>
          </Paper>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* --- NEW IMAGE ANALYSIS UI --- */}
      <Box>
        <Typography variant="h6">AI Image Analysis</Typography>
        <Button variant="contained" component="label" sx={{ mt: 2 }}>
          Upload Image
          <input type="file" hidden onChange={(e) => setImageFile(e.target.files[0])} accept="image/*" />
        </Button>
        {imageFile && <Typography sx={{ mt: 1, fontStyle: 'italic' }}>Selected: {imageFile.name}</Typography>}
        <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={handleImageAnalysis} disabled={!imageFile || isLoadingImage}>
          {isLoadingImage ? <CircularProgress size={24} /> : 'Analyze Image'}
        </Button>
        {imageResult && (
           <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
            <Typography variant="h6">Analysis Result:</Typography>
            <Typography>Detected: {imageResult.label}</Typography>
            <Typography>Confidence: {Math.round(imageResult.confidence * 100)}%</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Pets Dashboard
      </Typography>
      
      <DashboardTabs 
        petListComponent={myPetsComponent}
        symptomCheckerComponent={symptomCheckerComponent}
        vetLocatorComponent={<VetLocator />}
      />
      {/* ... (your vaccination modal code remains the same) ... */}
    </Container>
  );
}

export default DashboardPage;