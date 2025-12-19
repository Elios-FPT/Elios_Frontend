// src/auth/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Setup Axios Interceptor to handle session expiration (Security)
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // FIX: Only logout on 401 (Session Expired). 
        // 403 is used for "Banned" or "Permission Denied" and should be handled by the specific component, not global logout.
        if (error.response && error.response.status === 401) {
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    // 2. Check User Session once on mount
    const checkUserSession = async () => {
      try {
        const response = await axios.get("http://www.elios.com/api/users/me/profile", {
            withCredentials: true
        });
        
        if (response.data?.status === 200 && response.data?.data) {
          const { id, role } = response.data.data;
          setUser({ id, role }); 
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};