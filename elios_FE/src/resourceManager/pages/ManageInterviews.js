// src/resourceManager/pages/ManageInterviews.js
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../../components/navbars/UserNavbar';
import { API_ENDPOINTS } from '../../api/apiConfig';
import '../styles/ManageProject.css'; // Reuse same beautiful styles

const ManageInterviews = () => {
    const navigate = useNavigate();
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters & Pagination
    const [filters, setFilters] = useState({
        status: '',
        page: 1,
        pageSize: 12
    });

    const fetchInterviews = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Note: OpenAPI không có endpoint list interviews → giả sử backend sẽ bổ sung
            // Tạm thời dùng mock hoặc gọi custom endpoint nếu có
            const res = await axios.get(`http://localhost:8010/api/interviews`, {
                params: {
                    page: filters.page,
                    page_size: filters.pageSize,
                    status: filters.status || undefined,
                },
                withCredentials: true
            });

            if (res.data) {
                setInterviews(res.data.interviews || res.data.data || []);
            }
        } catch (err) {
            console.error('Fetch interviews error:', err);
            setError(err.response?.data?.message || 'Failed to load interviews');
            setInterviews([]);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchInterviews();
    }, [fetchInterviews]);

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'easy';
            case 'in_progress': return 'medium';
            case 'preparing': case 'planned': return 'hard';
            default: return '';
        }
    };

    const formatDate = (dateStr) => {
        return dateStr ? new Date(dateStr).toLocaleDateString('vi-VN') : '—';
    };

    if (loading) {
        return (
            <div className="full-screen-loader">
                <div className="spinner"></div>
                <p>Loading interviews...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="full-screen-loader">
                <p className="error-text">{error}</p>
                <button className="btn-success" onClick={fetchInterviews}>Retry</button>
            </div>
        );
    }

    return (
        <>
            <UserNavbar />
            <main className="dashboard-container">
                <div className="main-tabs-container">
                    <div className="tab-header">
                        <h1>Manage Interviews</h1>
                        <p className="intro-text">View and manage all AI mock interviews</p>
                    </div>

                    {/* Filters */}
                    <div className="filters-bar">
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                                className="filter-select"
                            >
                                <option value="">All Status</option>
                                <option value="PREPARING">Preparing</option>
                                <option value="PLANNED">Planned</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div style={{ marginLeft: 'auto', color: '#888' }}>
                            {interviews.length} interviews
                        </div>
                    </div>

                    {/* Interviews Grid */}
                    <div className="projects-grid">
                        {interviews.length > 0 ? (
                            interviews.map(interview => (
                                <div key={interview.id} className="project-card">
                                    <h3>Interview #{interview.id.slice(0, 8)}</h3>
                                    <p><strong>Candidate:</strong> {interview.candidate_id || 'Unknown'}</p>
                                    <p>
                                        <strong>Status:</strong>{' '}
                                        <span className={`difficulty-badge ${getStatusColor(interview.status)}`}>
                                            {interview.status || 'Unknown'}
                                        </span>
                                    </p>
                                    <p><strong>Questions:</strong> {interview.question_count || 0}</p>
                                    <p><strong>Progress:</strong> {Math.round(interview.progress_percentage || 0)}%</p>
                                    <p className="meta">
                                        Created: {formatDate(interview.created_at)}
                                        {interview.started_at && ` | Started: ${formatDate(interview.started_at)}`}
                                    </p>

                                    <div className="card-actions">
                                        <button
                                            onClick={() => navigate(`/interview/${interview.id}`)}
                                            className="btn-view"
                                        >
                                            View
                                        </button>
                                        {interview.status === 'COMPLETED' && (
                                            <button
                                                onClick={() => navigate(`/interview/${interview.id}/summary`)}
                                                className="btn-success"
                                            >
                                                Summary
                                            </button>
                                        )}
                                        {['PREPARING', 'PLANNED'].includes(interview.status) && (
                                            <button
                                                onClick={() => window.open(interview.ws_url, '_blank')}
                                                className="btn-edit"
                                            >
                                                Monitor
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-results">No interviews found.</p >
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default ManageInterviews;