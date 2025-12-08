// src/admin/pages/ReportedPosts.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { API_ENDPOINTS } from '../../../../api/apiConfig';
import '../styles/ReportedPosts.css';

const ReportedPosts = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtering State
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');

    // Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Ban/Unban Form State
    const [banReason, setBanReason] = useState('');
    const [banDuration, setBanDuration] = useState('7');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Resolution State
    const [moderatorNote, setModeratorNote] = useState('');

    const fetchReports = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_ENDPOINTS.REPORTED_CONTENT, {
                withCredentials: true
            });
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

    // --- Handle View Details ---
    const handleViewDetails = async (report) => {
        setSelectedReport(report);
        setModeratorNote(''); // Reset note
        setShowDetailModal(true);
        setDetailLoading(true);

        try {
            const response = await axios.get(API_ENDPOINTS.GET_DETAIL_REPORTED_CONTENT(report.reportId), {
                withCredentials: true
            });
            // Merge existing report data with new details
            setSelectedReport(prev => ({ ...prev, ...response.data.responseData }));
        } catch (error) {
            console.error("Error fetching report details:", error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleOpenBanModal = () => {
        if (!banReason && selectedReport) {
            setBanReason(`Banned due to report: ${selectedReport.reason}`);
        }
        setShowBanModal(true);
    };

    const handleRedirectToReportedPosts = () => {
        if (!selectedReport) return;

        // If it's a post, navigate to post ID. 
        // If comment, we ideally need parent Post ID (referenceId), otherwise try targetId.
        const navId = selectedReport.targetType === 'Post'
            ? selectedReport.targetId
            : (selectedReport.referenceId || selectedReport.targetId); // fallback

        // Close modal
        setShowDetailModal(false);
        
        // Open in new tab
        window.open(`/forum/post/${navId}`, '_blank');
    }

    const handleResolveReport = async (status, deleteContent) => {
        if (!selectedReport) return;
        setIsSubmitting(true);

        try {
            await axios.put(API_ENDPOINTS.RESOLVE_REPORTED_CONTENT(selectedReport.reportId), {
                status,        // 'Approved' or 'Rejected'
                deleteContent, // boolean
                moderatorNote  // string from state
            }, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            });

            alert(`Report ${status === 'Approved' ? 'approved' : 'rejected'} successfully.`);
            setShowDetailModal(false);
            fetchReports(); // Refresh list
        } catch (error) {
            console.error("Error resolving report:", error);
            alert("Failed to resolve report.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleBanUser = async () => {
        if (!selectedReport) return;
        setIsSubmitting(true);

        const banDate = new Date();
        if (banDuration === 'permanent') {
            banDate.setFullYear(banDate.getFullYear() + 100);
        } else {
            banDate.setDate(banDate.getDate() + parseInt(banDuration));
        }

        const payload = {
            userId: selectedReport.targetAuthorId,
            reason: banReason,
            banUntil: banDate.toISOString()
        };

        try {
            await axios.post(API_ENDPOINTS.BAN_USER, payload, {
                withCredentials: true,
                headers: { 'Content-Type': 'application/json' }
            });

            alert(`User ${selectedReport.targetAuthorFirstName} has been banned.`);
            setShowBanModal(false);
            setShowDetailModal(false);
            fetchReports();
        } catch (err) {
            console.error("Error banning user:", err);
            alert("Failed to ban user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Filter Logic
    const filteredReports = reports.filter(report => {
        const statusMatch = filterStatus === 'All' || report.status === filterStatus;
        const typeMatch = filterType === 'All' || report.targetType === filterType;
        return statusMatch && typeMatch;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending': return 'status-pending';
            case 'Approved': return 'status-approved';
            case 'Rejected': return 'status-rejected';
            default: return '';
        }
    };

    return (
        <div id="reported-posts-page">
            <h1>Reported Content</h1>
            <p>Review and moderate reported posts and comments.</p>

            <div className="filters-container">
                <div className="filter-group">
                    <label>Status:</label>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="All">All</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved (Resolved)</option>
                        <option value="Rejected">Rejected</option>
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

            <div className="reports-table-container">
                {loading ? (
                    <div className="text-center p-4"><Spinner animation="border" variant="light" /></div>
                ) : error ? (
                    <p className="error-msg">{error}</p>
                ) : filteredReports.length === 0 ? (
                    <p>No reports found matching your criteria.</p>
                ) : (
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Reported User</th>
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
                                        <div className="user-info-cell">
                                            <img
                                                src={report.targetAuthorAvatarUrl || 'default-avatar.png'}
                                                alt="avatar"
                                                className="table-avatar"
                                            />
                                            <div className="user-text-info">
                                                <span className="user-name">
                                                    {report.targetAuthorFirstName} {report.targetAuthorLastName}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge-type ${report.targetType.toLowerCase()}`}>
                                            {report.targetType}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{report.reason}</strong>
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
                                        <button
                                            className="btn-action btn-view"
                                            onClick={() => handleViewDetails(report)}
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* --- Report Details Modal --- */}
            {selectedReport && (
                <Modal
                    show={showDetailModal}
                    onHide={() => setShowDetailModal(false)}
                    centered
                    size="lg"
                    className="dark-theme-modal"
                >
                    <Modal.Header closeButton className="modal-header-custom">
                        <Modal.Title>Report Details</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="modal-body-custom">
                        {detailLoading ? (
                            <div className="loading-container">
                                <Spinner animation="border" variant="success" />
                                <p>Loading full details...</p>
                            </div>
                        ) : (
                            <>
                                {/* 1. The Reported User */}
                                <div className="detail-section">
                                    <h5>Reported User (Author)</h5>
                                    <div className="detail-user-card">
                                        <img
                                            src={selectedReport.targetAuthorAvatarUrl || 'default-avatar.png'}
                                            alt="Author"
                                            className="detail-avatar"
                                        />
                                        <div>
                                            <h6>{selectedReport.targetAuthorFirstName} {selectedReport.targetAuthorLastName}</h6>
                                            <small className="text-muted">ID: {selectedReport.targetAuthorId}</small>
                                            {selectedReport.isBanned && <span className="badge bg-danger ms-2">Banned</span>}
                                        </div>
                                        <div className="ms-auto d-flex gap-2">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={handleOpenBanModal}
                                            >
                                                Ban User
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. The Content */}
                                <div className="detail-section">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5>Reported Content ({selectedReport.targetType})</h5>

                                        {/* Updated to check logic and use new handler */}
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleRedirectToReportedPosts}
                                        >
                                            View Post
                                        </Button>
                                    </div>

                                    <div className="detail-content-box">
                                        {/* Show detail if available, else fallback to snippet or ID */}
                                        {selectedReport.targetContentDetail || selectedReport.targetContentSnippet || `ID: ${selectedReport.targetId}`}
                                    </div>
                                </div>

                                {/* 3. The Report Info */}
                                <div className="detail-section">
                                    <h5>Report Information</h5>
                                    <p><strong>Reason:</strong> {selectedReport.reason}</p>
                                    {selectedReport.details && <p><strong>Details:</strong> {selectedReport.details}</p>}
                                    <p><strong>Reporter:</strong> {selectedReport.reporterFirstName} {selectedReport.reporterLastName}</p>
                                    <p><strong>Date:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                                </div>

                                {/* 4. Resolution Actions (Only if Pending) */}
                                {selectedReport.status === 'Pending' && (
                                    <div className="detail-section resolution-section mt-4 pt-3 border-top border-secondary">
                                        <h5>Resolution</h5>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Moderator Note</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                value={moderatorNote}
                                                onChange={(e) => setModeratorNote(e.target.value)}
                                                placeholder="Add a note about this decision (optional)..."
                                                className="bg-dark text-white border-secondary"
                                            />
                                        </Form.Group>
                                        <div className="d-flex gap-2 justify-content-end">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleResolveReport('Rejected', false)}
                                                disabled={isSubmitting}
                                            >
                                                Dismiss Report (Keep Content)
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleResolveReport('Approved', true)}
                                                disabled={isSubmitting}
                                            >
                                                Approve Report & Delete Content
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="modal-footer-custom">
                        <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* --- Ban User Modal --- */}
            <Modal
                show={showBanModal}
                onHide={() => setShowBanModal(false)}
                centered
                className="dark-theme-modal"
            >
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>Ban User</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    <p>You are about to ban <strong>{selectedReport?.targetAuthorFirstName} {selectedReport?.targetAuthorLastName}</strong>.</p>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Ban Reason</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter reason..."
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Duration</Form.Label>
                            <Form.Select
                                value={banDuration}
                                onChange={(e) => setBanDuration(e.target.value)}
                            >
                                <option value="1">1 Day</option>
                                <option value="3">3 Days</option>
                                <option value="7">7 Days</option>
                                <option value="30">30 Days</option>
                                <option value="365">1 Year</option>
                                <option value="permanent">Permanent</option>
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <Button variant="secondary" onClick={() => setShowBanModal(false)}>Cancel</Button>
                    <Button
                        variant="danger"
                        onClick={handleBanUser}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Ban'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReportedPosts;