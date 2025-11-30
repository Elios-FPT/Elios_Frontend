// src/admin/pages/ReportedPosts.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../../api/apiConfig';
// import PostPreviewModal from '../forumComponents/PostPreviewModal'; // Uncomment if you want to reuse the preview modal later
import '../styles/ReportedPosts.css';

const ReportedPosts = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtering State
    const [filterStatus, setFilterStatus] = useState('All'); // All, Pending, Approved, Rejected
    const [filterType, setFilterType] = useState('All');     // All, Post, Comment

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_ENDPOINTS.REPORTED_CONTENT, {
                withCredentials: true
            });
            // Based on your provided JSON, the data is in response.data.responseData
            setReports(response.data.responseData || []);
        } catch (err) {
            console.error('Error fetching reported posts:', err);
            setError('Failed to load reports.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Handle Actions (Approve/Reject/Ignore) - Stubs for now
    const handleAction = (reportId, action) => {
        console.log(`Action: ${action} on report: ${reportId}`);
        // Implement API calls for resolving reports here
        // e.g., axios.put(API_ENDPOINTS.RESOLVE_REPORT(reportId), { action, ... })
    };

    // Filter Logic
    const filteredReports = reports.filter(report => {
        const statusMatch = filterStatus === 'All' || report.status === filterStatus;
        const typeMatch = filterType === 'All' || report.targetType === filterStatus; // Wait, targetType should match filterType
        // Correction:
        const typeMatchCorrect = filterType === 'All' || report.targetType === filterType;
        
        return statusMatch && typeMatchCorrect;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Approved': return 'status-approved'; // Meaning report was accepted/valid
            case 'Rejected': return 'status-rejected'; // Meaning report was invalid
            default: return '';
        }
    };

    return (
        <div id="reported-posts-page">
            <h1>Reported Content</h1>
            <p>Review and moderate reported posts and comments.</p>

            {/* Filters */}
            <div className="filters-container">
                <div className="filter-group">
                    <label>Status:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved (Resolved)</option>
                        {/* Add Rejected if your API supports it */}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Type:</label>
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Post">Post</option>
                        <option value="Comment">Comment</option>
                    </select>
                </div>
                <button className="btn-refresh" onClick={fetchReports}>Refresh</button>
            </div>

            {/* Content Table */}
            <div className="reports-table-container">
                {loading ? (
                    <p>Loading reports...</p>
                ) : error ? (
                    <p className="error-msg">{error}</p>
                ) : filteredReports.length === 0 ? (
                    <p>No reports found matching your criteria.</p>
                ) : (
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Target</th>
                                <th>Reason</th>
                                <th>Content Snippet</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map(report => (
                                <tr key={report.reportId}>
                                    <td>
                                        <span className={`badge-type ${report.targetType.toLowerCase()}`}>
                                            {report.targetType}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{report.reason}</strong>
                                        {report.details && <div className="report-details-small">{report.details}</div>}
                                    </td>
                                    <td className="content-cell" title={report.targetContentDetail}>
                                        "{report.targetContentSnippet}"
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(report.status)}`}>
                                            {report.status}
                                        </span>
                                    </td>
                                    <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {report.status === 'Pending' && (
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-action btn-view"
                                                    onClick={() => alert(`View details for: ${report.targetContentDetail}`)}
                                                >
                                                    View
                                                </button>
                                                {/* Add Resolve buttons here later */}
                                            </div>
                                        )}
                                        {report.status !== 'Pending' && (
                                            <span className="text-muted">Resolved</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ReportedPosts;