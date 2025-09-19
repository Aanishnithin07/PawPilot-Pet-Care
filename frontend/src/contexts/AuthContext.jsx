import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChange, getCurrentUser, getIdToken } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const token = await getIdToken();
          setIdToken(token);
          localStorage.setItem('firebase_token', token);
        } catch (error) {
          console.error('Error getting ID token:', error);
          setIdToken(null);
          localStorage.removeItem('firebase_token');
        }
      } else {
        setUser(null);
        setIdToken(null);
        localStorage.removeItem('firebase_token');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const refreshToken = async () => {
    if (user) {
      try {
        const token = await getIdToken(true); // Force refresh
        setIdToken(token);
        localStorage.setItem('firebase_token', token);
        return token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
    }
    return null;
  };

  const value = {
    user,
    idToken,
    loading,
    refreshToken,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};