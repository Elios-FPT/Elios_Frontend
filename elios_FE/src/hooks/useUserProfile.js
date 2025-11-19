// src/hooks/useUserProfile.js
import { useEffect, useState } from 'react';
import axios from 'axios';

const PROFILE_API = 'http://www.elios.com/api/users/me/profile';

export const useUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(PROFILE_API, { withCredentials: true });
        console.log('Profile API Response:', response.data);

        if (response.data?.status === 200 && response.data?.data) {
          const id = response.data.data.id;
          const role = response.data.data.role;
          localStorage.setItem('userId', id);
          localStorage.setItem('userRole', role);

          setUser({ id, role });
        } else {
          console.warn('Invalid profile response:', response.data);
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { user, loading };
};