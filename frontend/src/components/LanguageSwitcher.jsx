import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import { useLanguage } from '../context/LanguageContext';

function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <ButtonGroup variant="outlined" aria-label="language switcher" sx={{ ml: 2 }}>
      <Button 
        onClick={() => setLanguage('en')} 
        color={language === 'en' ? 'primary' : 'inherit'}
        variant={language === 'en' ? 'contained' : 'outlined'}
      >
        EN
      </Button>
      <Button 
        onClick={() => setLanguage('hi')} 
        color={language === 'hi' ? 'primary' : 'inherit'}
        variant={language === 'hi' ? 'contained' : 'outlined'}
      >
        HI
      </Button>
      <Button 
      onClick={() => setLanguage('ta')} 
      color={language === 'ta' ? 'primary' : 'inherit'}
      variant={language === 'ta' ? 'contained' : 'outlined'}
    >
      TA
    </Button>
    </ButtonGroup>
  );
}

export default LanguageSwitcher;