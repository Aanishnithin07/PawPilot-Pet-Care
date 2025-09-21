import React, { useState, useEffect, useCallback } from 'react';
import { Container, Box, Typography, TextField, Button, Grid, Card, CardContent, CircularProgress, Paper, Divider, CardActions, Alert, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosConfig';
import VetLocator from '../components/VetLocator';
import DashboardTabs from '../components/DashboardTabs';
import VaccinationModal from '../components/VaccinationModal';
import VetCommunityTab from '../components/VetCommunityTab';
import NutritionTab from '../components/NutritionTab';
import VoiceAssistantTab from '../components/VoiceAssistantTab'; // Ensure this path is correct
import { useLanguage } from '../context/LanguageContext'; // Ensure this path is correct

// Sub-component for the "My Pets" Tab Content
function MyPetsTab({ pets, upcomingVaccinations, onAddPet, onOpenVacModal, t }) {
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petWeight, setPetWeight] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);

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
      alert(t('errorBreedIdentification'));
    }
    setIsDetecting(false);
  };

  return (
    <Box>
      <Box component="form" onSubmit={handleAddPetSubmit} sx={{ mb: 4, p: 2, border: '1px solid grey', borderRadius: 2 }}>
        <Typography variant="h6">{t('addPetTitle')}</Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <Button variant="outlined" component="label" disabled={isDetecting}>
              {isDetecting ? t('analyzingPhoto') : t('uploadPhotoAutoDetectBreed')}
              <input type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t('petName')} value={petName} onChange={(e) => setPetName(e.target.value)} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t('breed')} value={petBreed} onChange={(e) => setPetBreed(e.target.value)} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t('age')} type="number" value={petAge} onChange={(e) => setPetAge(e.target.value)} required /></Grid>
          <Grid item xs={12} sm={6}><TextField fullWidth label={t('weightKg')} type="number" value={petWeight} onChange={(e) => setPetWeight(e.target.value)} required /></Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>{t('addPet')}</Button>
      </Box>

      <Typography variant="h5" gutterBottom>{t('myPetsSectionTitle')}</Typography>
      {pets.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('welcomeMessageNoPets')}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {pets.map((pet) => (
            <Grid item xs={12} md={6} lg={4} key={pet.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">{pet.name}</Typography>
                  <Typography color="text.secondary">{t('breed')}: {pet.breed}</Typography>
                  <Typography color="text.secondary">{t('age')}: {pet.age}</Typography>
                  <Typography color="text.secondary">{t('weightKg')}: {pet.weight} {t('kgSuffix')}</Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => onOpenVacModal(pet)}>{t('vaccinations')}</Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>{t('upcomingReminders')}</Typography>
      {upcomingVaccinations.length > 0 ? (
        <List>
          {upcomingVaccinations.map(vac => {
            const petNameForReminder = pets.find(p => p.id === vac.pet_id)?.name || t('yourPet');
            return (
              <ListItem key={vac.id}>
                  <ListItemText
                      primary={`${vac.vaccine_name} for ${petNameForReminder}`}
                      secondary={`${t('dueDate')}: ${vac.due_date}`}
                  />
              </ListItem>
            );
          })}
        </List>
      ) : (
        <Typography>{t('noUpcomingVaccinations')}</Typography>
      )}
    </Box>
  );
}

// Sub-component for the "AI Symptom Checker" Tab Content
function SymptomCheckerTab({ t }) {
    const [symptoms, setSymptoms] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [isLoadingText, setIsLoadingText] = useState(false);

    const [injuryImageFile, setInjuryImageFile] = useState(null);
    const [injuryResult, setInjuryResult] = useState('');
    const [isLoadingInjury, setIsLoadingInjury] = useState(false);

    const [breedImageFile, setBreedImageFile] = useState(null);
    const [breedResult, setBreedResult] = useState('');
    const [isLoadingBreed, setIsLoadingBreed] = useState(false);

    const handleGetDiagnosis = async (event) => {
        event.preventDefault();
        setIsLoadingText(true);
        setDiagnosis('');
        try {
            const response = await apiClient.post('/diagnose/text', { symptoms }); // Corrected endpoint
            setDiagnosis(response.data.diagnosis);
        } catch (error) {
            console.error('Failed to get diagnosis:', error);
            alert(t('errorGetDiagnosis'));
        }
        setIsLoadingText(false);
    };

    const handleInjuryAnalysis = async () => {
        if (!injuryImageFile) return alert(t('alertSelectInjuryPhoto'));
        setIsLoadingInjury(true);
        setInjuryResult('');
        const formData = new FormData();
        formData.append('file', injuryImageFile);
        try {
            const response = await apiClient.post('/diagnose/injury-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setInjuryResult(response.data.analysis);
        } catch (error) {
            console.error('Failed to analyze injury:', error);
            alert(t('errorAnalyzeImage'));
        }
        setIsLoadingInjury(false);
    };

    const handleBreedIdentification = async () => {
        if (!breedImageFile) return alert(t('alertSelectPetPhoto'));
        setIsLoadingBreed(true);
        setBreedResult('');
        const formData = new FormData();
        formData.append('file', breedImageFile);
        try {
            const response = await apiClient.post('/diagnose/breed-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setBreedResult(response.data.identification);
        } catch (error) {
            console.error('Failed to identify breed:', error);
            alert(t('errorIdentifyImage'));
        }
        setIsLoadingBreed(false);
    };

    return (
        <Box>
            <Box component="form" onSubmit={handleGetDiagnosis} sx={{ mb: 4 }}>
                <Typography variant="h6">{t('aiSymptomCheckerTitle')}</Typography>
                <TextField fullWidth multiline rows={3} label={t('describeSymptoms')} value={symptoms} onChange={(e) => setSymptoms(e.target.value)} required sx={{ mt: 2 }} />
                <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={isLoadingText}>{isLoadingText ? <CircularProgress size={24} /> : t('getAIAdvice')}</Button>
                {diagnosis && <Paper elevation={3} sx={{ mt: 2, p: 2 }}><Typography variant="h6">{t('preliminaryAdvice')}:</Typography><Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{diagnosis}</Typography></Paper>}
            </Box>
            <Divider sx={{ my: 4 }} />
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6">{t('aiInjuryAnalysis')}</Typography>
                <Button variant="contained" component="label" sx={{ mt: 2 }}>{t('uploadInjuryPhoto')}<input type="file" hidden onChange={(e) => setInjuryImageFile(e.target.files[0])} accept="image/*" /></Button>
                {injuryImageFile && <Typography sx={{ display: 'inline', ml: 2, fontStyle: 'italic' }}>{t('selected')}: {injuryImageFile.name}</Typography>}
                <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={handleInjuryAnalysis} disabled={!injuryImageFile || isLoadingInjury}>{isLoadingInjury ? <CircularProgress size={24} /> : t('analyzeInjury')}</Button>
                {injuryResult && <Paper elevation={3} sx={{ mt: 2, p: 2 }}><Typography variant="h6">{t('analysisResult')}:</Typography><Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{injuryResult}</Typography></Paper>}
            </Box>
            <Divider sx={{ my: 4 }} />
            <Box>
                <Typography variant="h6">{t('breedPetIdentifier')}</Typography>
                <Button variant="contained" component="label" sx={{ mt: 2 }}>{t('uploadPetPhoto')}<input type="file" hidden onChange={(e) => setBreedImageFile(e.target.files[0])} accept="image/*" /></Button>
                {breedImageFile && <Typography sx={{ display: 'inline', ml: 2, fontStyle: 'italic' }}>{t('selected')}: {breedImageFile.name}</Typography>}
                <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={handleBreedIdentification} disabled={!breedImageFile || isLoadingBreed}>{isLoadingBreed ? <CircularProgress size={24} /> : t('identifyBreed')}</Button>
                {breedResult && <Paper elevation={3} sx={{ mt: 2, p: 2 }}><Typography variant="h6">{t('identificationResult')}:</Typography><Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{breedResult}</Typography></Paper>}
            </Box>
        </Box>
    );
}

// Main Dashboard Page Component
function DashboardPage() {
  const [pets, setPets] = useState([]);
  const [upcomingVaccinations, setUpcomingVaccinations] = useState([]);
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const { t } = useLanguage(); 

  const fetchPetsAndVaccinations = useCallback(async () => {
    try {
      const petsResponse = await apiClient.get('/pets/');
      setPets(petsResponse.data);
      const vaccResponse = await apiClient.get('/vaccinations/upcoming');
      setUpcomingVaccinations(vaccResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert(t('errorFailedToFetchData'));
      navigate('/login');
    }
  }, [navigate, t]);

  useEffect(() => {
    fetchPetsAndVaccinations();
  }, [fetchPetsAndVaccinations]);

  const handleAddPet = async (newPet) => {
    try {
      await apiClient.post('/pets/', newPet);
      fetchPetsAndVaccinations();
    } catch (error) { 
      console.error('Failed to add pet:', error); 
      alert(t('errorAddPet'));
    }
  };
  
  const handleOpenModal = (pet) => { 
    setSelectedPet(pet); 
    setModalOpen(true); 
  };

  const handleCloseModal = () => { 
    setModalOpen(false); 
    setSelectedPet(null); 
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('dashboardTitle')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('platformTagline')}
      </Typography>
      
      <DashboardTabs 
        petListComponent={<MyPetsTab 
                              pets={pets} 
                              upcomingVaccinations={upcomingVaccinations} 
                              onAddPet={handleAddPet} 
                              onOpenVacModal={handleOpenModal} 
                              t={t} 
                          />}
        symptomCheckerComponent={<SymptomCheckerTab t={t} />} 
        vetLocatorComponent={<VetLocator t={t} />} 
        vetCommunityComponent={<VetCommunityTab t={t} />} 
        nutritionComponent={<NutritionTab t={t} />} 
        voiceAssistantComponent={<VoiceAssistantTab t={t} />} 
      />

      {selectedPet && <VaccinationModal open={modalOpen} onClose={handleCloseModal} pet={selectedPet} t={t} />}
    </Container>
  );
}

export default DashboardPage;