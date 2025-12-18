// src/hooks/useUserProfile.js
import { useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';

export const useUserProfile = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useUserProfile must be used within an AuthProvider');
  }

  return context; // Returns { user, loading, setUser }
};