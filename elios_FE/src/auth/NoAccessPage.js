// src/pages/NoAccessPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/navbars/UserNavbar';

const NoAccessPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <UserNavbar />
      <div style={{
        minHeight: '100vh',
        background: '#121212',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ color: '#ff6b6b' }}>Access Denied</h1>
        <p>You don't have permission to access this page.</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: '1rem',
            padding: '10px 20px',
            background: '#50fa7b',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    </>
  );
};

export default NoAccessPage;