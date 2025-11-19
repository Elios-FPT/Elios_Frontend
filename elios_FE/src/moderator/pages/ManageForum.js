// src/moderator/pages/ManageForum.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageForum.css';

const ManageForum = () => {
  const navigate = useNavigate();
  const [pendingPosts, setPendingPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_PENDING_POSTS, { withCredentials: true });
        setPendingPosts(res.data.responseData || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading pending posts:', err);
        setError('Failed to load pending posts.');
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleApprove = async (postId) => {
    try {
      await axios.post(API_ENDPOINTS.APPROVE_PENDING_POST(postId), {}, { withCredentials: true });
      setPendingPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      alert('Approve failed');
    }
  };

  const handleReject = async (postId) => {
    if (window.confirm('Reject this post?')) {
      try {
        await axios.post(API_ENDPOINTS.REJECT_PENDING_POST(postId), {}, { withCredentials: true });
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
      } catch (err) {
        alert('Reject failed');
      }
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Delete this post permanently?')) {
      try {
        await axios.delete(API_ENDPOINTS.MODERATOR_DELETE_POST(postId), { withCredentials: true });
        setPendingPosts(prev => prev.filter(p => p.id !== postId));
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
            <p>Loading forum moderation...</p>
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
            <h1>Moderate Forum</h1>
            <p className="intro-text">Review and manage pending posts.</p>
          </div>

          <div className="projects-grid">
            {pendingPosts.length > 0 ? (
              pendingPosts.map(post => (
                <div key={post.id} className="project-card">
                  <h3>{post.title}</h3>
                  <p><strong>Author:</strong> {post.authorName}</p>
                  <p><strong>Created:</strong> {new Date(post.createdAt).toLocaleDateString()}</p>
                  <div className="card-actions">
                    <button className="btn-success" onClick={() => handleApprove(post.id)}>Approve</button>
                    <button className="btn-warning" onClick={() => handleReject(post.id)}>Reject</button>
                    <button className="btn-danger" onClick={() => handleDelete(post.id)}>Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No pending posts.</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default ManageForum;