// src/resourceManager/pages/ViewCodingPractice.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FiChevronLeft, FiEdit3 } from 'react-icons/fi';

const ViewCodingPractice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_CODE_PRACTICE_DETAIL(id), {
          withCredentials: true
        });

        if (res.data.status === 200 && res.data.data) {
          setProblem(res.data.data);
        } else {
          throw new Error(res.data.message || 'Problem not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load problem');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProblem();
  }, [id]);

  if (loading) {
    return (
      <div className="full-screen-loader">
        <div className="spinner"></div>
        <p>Loading problem...</p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="full-screen-loader">
        <p className="error-text">{error || 'Problem not found'}</p>
        <button className="btn-success" onClick={() => navigate('/manage-coding-bank')}>
          Back to Coding Bank
        </button>
      </div>
    );
  }

  return (
    <>
      <UserNavbar />
      <main className="dashboard-container">
        <div className="main-tabs-container">
          <div className="tab-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1>{problem.title}</h1>
                <p className="intro-text">Coding Practice Problem</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn-cancel" onClick={() => navigate('/manage-coding-bank')}>
                  <FiChevronLeft /> Back
                </button>
                <button className="btn-success" onClick={() => navigate(`/manage-coding-bank/edit/${id}`)}>
                  <FiEdit3 /> Edit
                </button>
              </div>
            </div>
          </div>

          <div style={{ padding: '32px' }}>
            {/* Difficulty + Acceptance */}
            <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={`difficulty-badge ${problem.difficulty?.toLowerCase()}`}>
                {problem.difficulty || 'Unknown'}
              </span>
              {problem.acceptanceRate > 0 && (
                <span style={{
                  background: 'rgba(80, 250, 123, 0.15)',
                  color: '#50fa7b',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '0.9rem'
                }}>
                  {(problem.acceptanceRate * 100).toFixed(1)}% Accepted
                </span>
              )}
            </div>

            {/* Topics */}
            {problem.topics?.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                {problem.topics.map((topic, i) => (
                  <span key={i} className="topic-tag">{topic}</span>
                ))}
              </div>
            )}

            {/* Description */}
            <div style={{ marginBottom: '3rem' }}>
              <h3 style={{ color: '#50fa7b', marginBottom: '1rem' }}>Problem Description</h3>
              <div className="markdown-preview" style={{
                padding: '2rem',
                background: '#1e1e1e',
                border: '1px solid #333',
                borderRadius: '12px',
                minHeight: '400px',
                fontSize: '1rem',
                lineHeight: '1.7'
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {problem.description || '*No description provided.*'}
                </ReactMarkdown>
              </div>
            </div>

            {/* Meta */}
            <div style={{ color: '#888', fontSize: '0.9rem', paddingTop: '2rem', borderTop: '1px solid #444' }}>
              <p><strong>Created:</strong> {new Date(problem.createdAt).toLocaleString()}</p>
              {problem.updatedAt && problem.updatedAt !== problem.createdAt && (
                <p><strong>Updated:</strong> {new Date(problem.updatedAt).toLocaleString()}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ViewCodingPractice;