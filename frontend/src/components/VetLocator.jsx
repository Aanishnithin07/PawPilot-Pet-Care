import React, { useState } from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { Box, Typography, List, ListItem, ListItemText, CircularProgress, Button, Link, ButtonGroup } from '@mui/material';
import apiClient from '../api/axiosConfig'; // Our own API client

const containerStyle = {
  width: '100%',
  height: '400px'
};

const libraries = ['places'];

function VetLocator() {
  const [center, setCenter] = useState({ lat: 20.5937, lng: 78.9629 }); // Default to center of India
  const [zoom, setZoom] = useState(4);
  const [places, setPlaces] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
  });

  const handleSearch = (searchType) => {
    if (!navigator.geolocation) {
      return alert('Geolocation is not supported by your browser.');
    }
    
    setIsSearching(true);
    setPlaces([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setCenter(location);
        setZoom(13);

        try {
          // This now calls OUR backend, not Google directly
          const response = await apiClient.post('/places/nearby', { 
            lat: location.lat,
            lng: location.lng,
            search_type: searchType 
          });
          
          if (response.data.places) {
            setPlaces(response.data.places);
          } else {
            setPlaces([]);
            alert('No results found nearby.');
          }
        } catch (error) {
          console.error("Failed to fetch places:", error);
          alert('An error occurred while searching for nearby places.');
        } finally {
          setIsSearching(false);
        }
      },
      () => {
        alert('Could not get your location. Please enable location services.');
        setIsSearching(false);
      }
    );
  };

  if (!isLoaded) return <CircularProgress />;

  return (
    <Box>
        <ButtonGroup variant="contained" aria-label="outlined primary button group">
            <Button onClick={() => handleSearch('veterinary_care')} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Find Vets Near Me'}
            </Button>
            <Button onClick={() => handleSearch('pharmacy')} disabled={isSearching}>
                Find Pet Pharmacies
            </Button>
        </ButtonGroup>
        <Box sx={{mt: 2, height: '400px', width: '100%', border: '1px solid grey'}}>
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={zoom}
            >
                {userLocation && <Marker position={userLocation} title="Your Location" />}
                {places && places.map((place) => (
                    <Marker 
                      key={place.name + place.location.latitude} 
                      position={{lat: place.location.latitude, lng: place.location.longitude}} 
                      title={place.displayName.text}
                    />
                ))}
            </GoogleMap>
        </Box>
        {places.length > 0 && (
            <>
                <Typography variant="h6" sx={{mt: 2}}>Results:</Typography>
                <List>
                    {places.map((place) => (
                        <ListItem key={place.name + place.formattedAddress} secondaryAction={
                            <Button 
                                edge="end" 
                                variant="outlined"
                                href={`https://www.google.com/maps/dir/?api=1&destination=${place.formattedAddress}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Get Directions
                            </Button>
                        }>
                            <ListItemText primary={place.displayName.text} secondary={place.formattedAddress} />
                        </ListItem>
                    ))}
                </List>
            </>
        )}
    </Box>
  );
}

export default VetLocator;