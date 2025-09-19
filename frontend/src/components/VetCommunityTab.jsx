import React from 'react';
import { Box, Typography, Card, CardContent, Button, Grid, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const vets = [
  {
    id: 1,
    name: 'Dr. Priya Sharma',
    specialty: 'Canine Internal Medicine',
    experience: '12 Years Experience',
    rate: '₹ 750/hour',
    imageUrl: 'https://via.placeholder.com/150/191970/FFFFFF?text=Dr.Priya',
  },
  {
    id: 2,
    name: 'Dr. Arjun Singh',
    specialty: 'Feline Behaviorist',
    experience: '8 Years Experience',
    rate: '₹ 600/hour',
    imageUrl: 'https://via.placeholder.com/150/4682B4/FFFFFF?text=Dr.Arjun',
  },
  {
    id: 3,
    name: 'Dr. Neha Gupta',
    specialty: 'Exotic Pets Specialist',
    experience: '15 Years Experience',
    rate: '₹ 900/hour',
    imageUrl: 'https://via.placeholder.com/150/6A5ACD/FFFFFF?text=Dr.Neha',
  },
  {
    id: 4,
    name: 'Dr. Rohan Mehra',
    specialty: 'Emergency & Critical Care',
    experience: '10 Years Experience',
    rate: '₹ 850/hour',
    imageUrl: 'https://via.placeholder.com/150/ADD8E6/000000?text=Dr.Rohan',
  },
];

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

const StyledCardContent = styled(CardContent)({
  flexGrow: 1,
  textAlign: 'center',
});

function VetCommunityTab() {
  const handleRequestConsultation = (vetName) => {
    alert(`Consultation request sent for ${vetName}! A representative will contact you shortly.`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Connect with Verified Veterinarians
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Get expert advice directly from certified vets. Request a consultation and they will reach out to you!
      </Typography>
      <Grid container spacing={3}>
        {vets.map((vet) => (
          <Grid item xs={12} sm={6} md={4} key={vet.id}>
            <StyledCard>
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
                <Avatar alt={vet.name} src={vet.imageUrl} sx={{ width: 80, height: 80 }} />
              </Box>
              <StyledCardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {vet.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {vet.specialty}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {vet.experience}
                </Typography>
                <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                  {vet.rate}
                </Typography>
              </StyledCardContent>
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleRequestConsultation(vet.name)}
                >
                  Request Consultation
                </Button>
              </Box>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default VetCommunityTab;