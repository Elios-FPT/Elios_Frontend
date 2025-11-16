// src/resourceManager/pages/ManageCodingBank.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageCoding.css';

const ManageCodingBank = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_CODE_CHALLENGES_LIST, { withCredentials: true });
        setChallenges(res.data.responseData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading coding challenges:', err);
        setError('Failed to load coding challenges.');
        setLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const handleEdit = (id) => {
    navigate(`/manage-coding-bank/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this challenge?')) {
      try {
        await axios.delete(API_ENDPOINTS.GET_CODE_CHALLENGE_DETAIL(id), { withCredentials: true });
        setChallenges(prev => prev.filter(c => c.id !== id));
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  if (loading || error) {
    return (
      <div className="full-screen-loader">
        {loading ? (
          <>
            <div className="spinner"></div>
            <p>Loading coding bank...</p>
          </>
        ) : (
          <p className="error-text">{error}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <h1>Manage Coding Bank</h1>
            <p className="intro-text">Create, edit, and manage coding challenges.</p>
            <button className="btn-success" onClick={() => navigate('/manage-coding-bank/create')}>
              + New Challenge
            </button>
          </div>

          <div className="projects-grid">
            {challenges.length > 0 ? (
              challenges.map(challenge => (
                <div key={challenge.id} className="project-card">
                  <h3>{challenge.title}</h3>
                  <p><strong>Language:</strong> {challenge.language}</p>
                  <p><strong>Difficulty:</strong> {challenge.difficulty}</p>
                  <div className="card-actions">
                    <button onClick={() => handleEdit(challenge.id)}>Edit</button>
                    <button className="btn-danger" onClick={() => handleDelete(challenge.id)}>Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No coding challenges found.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ManageCodingBank;