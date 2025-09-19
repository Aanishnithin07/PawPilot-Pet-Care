import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, TextField, Button, Grid, Card, CardContent, CircularProgress, Paper, Divider, CardActions, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import VetLocator from '../components/VetLocator';
import DashboardTabs from '../components/DashboardTabs';
import VaccinationModal from '../components/VaccinationModal';
import VetCommunityTab from '../components/VetCommunityTab';
import NutritionTab from '../components/NutritionTab'; // <--- THIS IS THE CRITICAL LINE!

// Sub-component for the "My Pets" Tab Content
function MyPetsTab({ pets, upcomingVaccinations, onAddPet, onOpenVacModal }) {
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [isDetecting, setIsDetecting] = useState(false); // For breed auto-detection (already present)

  const handleAddPetSubmit = (event) => {
    event.preventDefault();
    const newPet = { name: petName, breed: petBreed, age: parseInt(petAge), weight: parseFloat(petWeight) };
    onAddPet(newPet);
    setPetName(''); setPetBreed(''); setPetAge(''); setPetWeight('');
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsDetecting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post('/diagnose/breed-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const resultText = response.data.identification;
      if (resultText.includes("Breed:")) {
        const breed = resultText.split("Breed:")[1].trim();
        setPetBreed(breed);
      }
    } catch (error) {
      console.error('Failed to identify breed from photo:', error);
      alert('Could not identify breed from the photo.');
    }
    setIsDetecting(false);
  };

  return (
    <Box>
      <Box component="form" onSubmit={handleAddPetSubmit} sx={{ mb: 4, p: 2, border: '1px solid grey', borderRadius: 2 }}>
        <Typography variant="h6">Add a New Pet</Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Button variant="outlined" component="label" disabled={isDetecting}>
              {isDetecting ? 'Analyzing Photo...' : 'Upload Photo to Auto-Detect Breed'}
              <input type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Pet Name" value={petName} onChange={(e) => setPetName(e.target.value)} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Breed" value={petBreed} onChange={(e) => setPetBreed(e.target.value)} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Age" type="number" value={petAge} onChange={(e) => setPetAge(e.target.value)} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label="Weight (kg)" type="number" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} required /></Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Add Pet</Button>
      </Box>

      <Typography variant="h5" gutterBottom>My Pets</Typography>
      {/* --- This block was updated for the welcome message --- */}
      {pets.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Welcome to PawPilot! It looks like you haven't added a pet yet. Use the form above to get started!
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {pets.map((pet) => (
            <Grid item xs={12} md={6} lg={4} key={pet.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{pet.name}</Typography>
                  <Typography color="text.secondary">Breed: {pet.breed}</Typography>
                  <Typography color="text.secondary">Age: {pet.age}</Typography>
                  <Typography color="text.secondary">Weight: {pet.weight} kg</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => onOpenVacModal(pet)}>Vaccinations</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      {/* --- End of welcome message block --- */}

      <Divider sx={{ my: 4 }} />

      {/* --- This block was added for upcoming reminders --- */}
      <Typography variant="h5" gutterBottom>Upcoming Reminders</Typography>
      {upcomingVaccinations.length > 0 ? (
        <List>
          {upcomingVaccinations.map(vac => (
            <ListItem key={vac.id}>
                <ListItemText
                    primary={`${vac.vaccine_name} for ${pets.find(p => p.id === vac.pet_id)?.name || 'your pet'}`}
                    secondary={`Due on: ${vac.due_date}`}
                />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography>No upcoming vaccination dates scheduled.</Typography>
      )}
      {/* --- End of upcoming reminders block --- */}
    </Box>
  );
}

// Sub-component for the "AI Symptom Checker" Tab Content
function SymptomCheckerTab() {
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [isLoadingText, setIsLoadingText] = useState(false);

    const [injuryImageFile, setInjuryImageFile] = useState(null);
    const [injuryResult, setInjuryResult] = useState('');
    const [isLoadingInjury, setIsLoadingInjury] = useState(false);

    const [breedImageFile, setBreedImageFile] = useState(null);
    const [breedResult, setBreedResult] = useState('');
    const [isLoadingBreed, setIsLoadingBreed] = useState(false);

    // Remove all nutrition state variables and handlers

    const handleGetDiagnosis = async (event) => {
        event.preventDefault();
        setIsLoadingText(true);
        setDiagnosis('');
        try {
            const response = await apiClient.post('/diagnose/symptoms', { symptoms });
            setDiagnosis(response.data.diagnosis);
        } catch (error) {
            console.error('Failed to get diagnosis:', error);
            alert('Failed to get diagnosis.');
        }
        setIsLoadingText(false);
    };

    const handleInjuryAnalysis = async () => {
        if (!injuryImageFile) return alert('Please select an injury photo first.');
        setIsLoadingInjury(true);
        setInjuryResult('');
        const formData = new FormData();
        formData.append('file', injuryImageFile);
        try {
            const response = await apiClient.post('/diagnose/injury-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setInjuryResult(response.data.analysis);
        } catch (error) {
            console.error('Failed to analyze injury:', error);
            alert('Failed to analyze image.');
        }
        setIsLoadingInjury(false);
    };

    const handleBreedIdentification = async () => {
        if (!breedImageFile) return alert('Please select a pet photo first.');
        setIsLoadingBreed(true);
        setBreedResult('');
        const formData = new FormData();
        formData.append('file', breedImageFile);
        try {
            const response = await apiClient.post('/diagnose/breed-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setBreedResult(response.data.identification);
        } catch (error) {
            console.error('Failed to identify breed:', error);
            alert('Failed to identify image.');
        }
        setIsLoadingBreed(false);
    };

    return (
        <Box>
            <Box component="form" onSubmit={handleGetDiagnosis} sx={{ mb: 4 }}>
                <Typography variant="h6">AI Symptom Checker (Text)</Typography>
                <TextField fullWidth multiline rows={3} label="Describe your pet's symptoms..." value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required sx={{ mt: 2 }} />
                <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isLoadingText}>{isLoadingText ? <CircularProgress size={24} /> : 'Get AI Advice'}</Button>
                {diagnosis && <Paper elevation={3} sx={{ mt: 2, p: 2 }}><Typography variant="h6">Preliminary Advice:</Typography><Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{diagnosis}</Typography></Paper>}
            </Box>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6">AI Injury/Condition Analysis (Image)</Typography>
                <Button variant="contained" component="label" sx={{ mt: 2 }}>Upload Injury Photo<input type="file" hidden onChange={(e) => setInjuryImageFile(e.target.files[0])} accept="image/*" /></Button>
                {injuryImageFile && <Typography sx={{ display: 'inline', ml: 2, fontStyle: 'italic' }}>Selected: {injuryImageFile.name}</Typography>}
                <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={handleInjuryAnalysis} disabled={!injuryImageFile || isLoadingInjury}>{isLoadingInjury ? <CircularProgress size={24} /> : 'Analyze Injury'}</Button>
                {injuryResult && <Paper elevation={3} sx={{ mt: 2, p: 2 }}><Typography variant="h6">Analysis Result:</Typography><Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{injuryResult}</Typography></Paper>}
            </Box>
            <Divider sx={{ my: 4 }} />
            <Box>
                <Typography variant="h6">Breed/Pet Identifier (Image)</Typography>
                <Button variant="contained" component="label" sx={{ mt: 2 }}>Upload Pet Photo<input type="file" hidden onChange={(e) => setBreedImageFile(e.target.files[0])} accept="image/*" /></Button>
                {breedImageFile && <Typography sx={{ display: 'inline', ml: 2, fontStyle: 'italic' }}>Selected: {breedImageFile.name}</Typography>}
                <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={handleBreedIdentification} disabled={!breedImageFile || isLoadingBreed}>{isLoadingBreed ? <CircularProgress size={24} /> : 'Identify Breed'}</Button>
                {breedResult && <Paper elevation={3} sx={{ mt: 2, p: 2 }}><Typography variant="h6">Identification Result:</Typography><Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{breedResult}</Typography></Paper>}
            </Box>
        </Box>
    );
}


// Main Dashboard Page Component
function DashboardPage() {
  const [pets, setPets] = useState([]);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  // --- ADDED: State for upcoming vaccinations ---
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);


  // --- UPDATED: Combined fetch function for pets and vaccinations ---
  const fetchPetsAndVaccinations = useCallback(async () => {
    try {
      const petsResponse = await apiClient.get('/pets/');
      setPets(petsResponse.data);
      const vaccResponse = await apiClient.get('/vaccinations/upcoming');
      setUpcomingVaccinations(vaccResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    fetchPetsAndVaccinations();
  }, [fetchPetsAndVaccinations]);
  // --- END UPDATED ---

  // --- UPDATED: handleAddPet to refetch data ---
  const handleAddPet = async (newPet) => {
    try {
      await apiClient.post('/pets/', newPet);
      fetchPetsAndVaccinations(); // This ensures pets and reminders are refreshed
    } catch (error) { console.error('Failed to add pet:', error); alert('Failed to add pet.'); }
  };
  // --- END UPDATED ---
  
  const handleOpenModal = (pet) => { setSelectedPet(pet); setModalOpen(true); };
  const handleCloseModal = () => { setModalOpen(false); setSelectedPet(null); };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Pets Dashboard
      </Typography>
      
     // In frontend/src/pages/DashboardPage.jsx

<DashboardTabs 
  petListComponent={
    <MyPetsTab 
      pets={pets}
      upcomingVaccinations={upcomingVaccinations}
      onAddPet={handleAddPet}
      onOpenVacModal={handleOpenModal}
    />
  }
  symptomCheckerComponent={<SymptomCheckerTab />}
  vetLocatorComponent={<VetLocator />}
  vetCommunityComponent={<VetCommunityTab />}
  nutritionComponent={<NutritionTab />}
/>

      {selectedPet && <VaccinationModal open={modalOpen} onClose={handleCloseModal} pet={selectedPet} />}
    </Container>
  );
}

export default DashboardPage;