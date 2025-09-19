import React, { useState, useRef } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, IconButton, Alert, Divider } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import apiClient from '../api/axiosConfig'; // Our existing API client

function VoiceAssistantTab() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Speech Recognition is not supported by this browser. Please use Chrome.');
      return;
    }

    setError('');
    setTranscript('');
    setAiResponse('');
    setListening(true);

    const SpeechRecognition = window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false; // Listen for a single utterance
    recognitionRef.current.interimResults = false; // Only give final results
    recognitionRef.current.lang = 'en-IN'; // Indian English

    recognitionRef.current.onresult = (event) => {
      const finalTranscript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join('');
      setTranscript(finalTranscript);
      stopListening(); // Stop listening after result
      handleGetAiResponse(finalTranscript); // Send to AI
    };

    recognitionRef.current.onerror = (event) => {
      setError(`Speech recognition error: ${event.error}`);
      console.error('Speech recognition error:', event.error);
      setListening(false);
    };

    recognitionRef.current.onend = () => {
      setListening(false);
    };

    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setListening(false);
  };

  const handleGetAiResponse = async (question) => {
    if (!question.trim()) {
      setError('Please speak a question.');
      return;
    }
    setIsLoading(true);
    setAiResponse('');
    setError('');
    try {
        // We'll reuse the existing /diagnose/text endpoint
        // In a full Dialogflow integration, this would go to a Dialogflow agent.
        const response = await apiClient.post('/diagnose/text', { symptoms: question });
        setAiResponse(response.data.diagnosis);
    } catch (err) {
        console.error('AI response failed:', err);
        setError('Failed to get AI response. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };


  return (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        "Ok PawPilot" Voice Assistant
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Speak naturally to PawPilot for instant advice on your pet's health and well-being.
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mb: 4, display: 'inline-block' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
          <IconButton 
            color={listening ? "error" : "primary"} 
            onClick={listening ? stopListening : startListening} 
            disabled={isLoading}
            sx={{ width: 80, height: 80, border: `2px solid ${listening ? 'red' : 'primary'}`, '&:hover': { bgcolor: listening ? 'error.dark' : 'primary.dark' } }}
          >
            {listening ? <StopIcon sx={{ fontSize: 40 }} /> : <MicIcon sx={{ fontSize: 40 }} />}
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            {listening ? 'Listening...' : 'Tap to Speak'}
          </Typography>
        </Box>
        {transcript && (
          <Typography variant="body1" sx={{ mt: 2, fontStyle: 'italic' }}>
            You said: "{transcript}"
          </Typography>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>

      {isLoading && <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />}

      {aiResponse && (
        <Paper elevation={3} sx={{ p: 3, mt: 4, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>PawPilot's Response:</Typography>
          <Typography sx={{ whiteSpace: 'pre-wrap', mt: 1 }}>{aiResponse}</Typography>
          <Alert severity="info" sx={{ mt: 2 }}>
            This advice is for informational purposes. Always consult a vet for professional medical recommendations.
          </Alert>
        </Paper>
      )}

      <Divider sx={{ my: 4 }} />
      <Box sx={{ mt: 2, p: 3, bgcolor: 'background.paper', borderRadius: 2, textAlign: 'left' }}>
        <Typography variant="h6" gutterBottom>Future Integrations:</Typography>
        <Typography variant="body2" color="text.secondary">
          This voice assistant is the first step towards a full **Dialogflow CX** integration, enabling complex multi-turn conversations for pet triage, emergency guidance, and smart home pet care. We envision leveraging **Cloud Healthcare API** to inform responses with pet's health records and **Speech-to-Text API** for more robust, cloud-powered transcription.
        </Typography>
      </Box>

    </Box>
  );
}

export default VoiceAssistantTab;