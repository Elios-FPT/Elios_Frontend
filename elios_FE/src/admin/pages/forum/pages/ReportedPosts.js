// src/admin/pages/ReportedPosts.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button, Form, Spinner } from 'react-bootstrap'; 
import { API_ENDPOINTS } from '../../../../api/apiConfig';
import '../styles/ReportedPosts.css';

const ReportedPosts = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtering State
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterType, setFilterType] = useState('All');

    // Modal State
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [showUnbanModal, setShowUnbanModal] = useState(false); // New: Unban Modal
    const [selectedReport, setSelectedReport] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false); // New: Loading for details

    // Ban/Unban Form State
    const [banReason, setBanReason] = useState('');
    const [unbanReason, setUnbanReason] = useState(''); // New: Unban Reason
    const [banDuration, setBanDuration] = useState('7'); 
    const [isSubmitting, setIsSubmitting] = useState(false); // Generic submitting state

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

    // --- Updated: Handle View Details ---
    const handleViewDetails = async (report) => {
        setSelectedReport(report); // Show immediate data first
        setShowDetailModal(true);
        setDetailLoading(true); // Start loading

        try {
            const response = await axios.get(API_ENDPOINTS.GET_DETAIL_REPORTED_CONTENT(report.reportId), {
                withCredentials: true
            });
            // Merge the existing report data with the new details
            setSelectedReport(prev => ({ ...prev, ...response.data.responseData }));
        } catch (error) {
            console.error("Error fetching report details:", error);
            // Optional: Show a toast error here
        } finally {
            setDetailLoading(false); // Stop loading
        }
    };

    // --- Updated: Handle Unban User ---
    const handleUnbanUser = async () => {
        // Validation: Need a selected report and a banId (Assuming backend sends banId in details)
        // If your report detail doesn't have banId, you might need to fetch the user's ban status first.
        if (!selectedReport || !selectedReport.banId) {
            alert("No Ban ID found for this user. They might not be banned.");
            return;
        }

        setIsSubmitting(true);
        try {
            await axios.put(API_ENDPOINTS.UN_BAN_USER(selectedReport.banId), {
                unbanReason: unbanReason
            }, {
                withCredentials: true
            });
            
            alert(`User ${selectedReport.targetAuthorFirstName} has been unbanned.`);
            setShowUnbanModal(false);
            setShowDetailModal(false);
            setUnbanReason(''); // Reset form
            fetchReports(); // Refresh list
        } catch (error) {
            console.error('Error unban user:', error);
            alert("Failed to unban user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Open Ban Modal
    const handleOpenBanModal = () => {
        if (!banReason && selectedReport) {
            setBanReason(`Banned due to report: ${selectedReport.reason}`);
        }
        setShowBanModal(true);
    };

    // Open Unban Modal
    const handleOpenUnbanModal = () => {
        setUnbanReason(''); // Reset reason
        setShowUnbanModal(true);
    };

    // Submit Ban API
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

    // Filter Logic & Helpers (Unchanged)
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

            {/* Filters */}
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

            {/* Content Table */}
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
                                            src={selectedReport.targetAuthorAvatarUrl} 
                                            alt="Author" 
                                            className="detail-avatar"
                                        />
                                        <div>
                                            <h6>{selectedReport.targetAuthorFirstName} {selectedReport.targetAuthorLastName}</h6>
                                            <small className="text-muted">ID: {selectedReport.targetAuthorId}</small>
                                            {/* Show status if available in details */}
                                            {selectedReport.isBanned && <span className="badge bg-danger ms-2">Banned</span>}
                                        </div>
                                        <div className="ms-auto d-flex gap-2">
                                            {/* Logic: If report says user is banned, show Unban, else show Ban */}
                                            {/* Since we don't know 'isBanned' from the snippet, showing both for now or conditional based on your API data */}
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={handleOpenBanModal}
                                            >
                                                Ban User
                                            </Button>
                                            
                                            {/* Only enable/show this if we have a banId */}
                                            {selectedReport.banId && (
                                                <Button 
                                                    variant="warning" 
                                                    size="sm" 
                                                    onClick={handleOpenUnbanModal}
                                                >
                                                    Unban User
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. The Content */}
                                <div className="detail-section">
                                    <h5>Reported Content ({selectedReport.targetType})</h5>
                                    <div className="detail-content-box">
                                        {selectedReport.targetContentDetail}
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
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="modal-footer-custom">
                        <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                            Close
                        </Button>
                        {selectedReport.status === 'Pending' && !detailLoading && (
                            <Button variant="success">
                                Mark as Resolved
                            </Button>
                        )}
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

            {/* --- Unban User Modal --- */}
            <Modal 
                show={showUnbanModal} 
                onHide={() => setShowUnbanModal(false)} 
                centered
                className="dark-theme-modal"
            >
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>Unban User</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    <p>You are about to unban <strong>{selectedReport?.targetAuthorFirstName} {selectedReport?.targetAuthorLastName}</strong>.</p>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Unban Reason</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Why are you unbanning this user?" 
                                value={unbanReason}
                                onChange={(e) => setUnbanReason(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <Button variant="secondary" onClick={() => setShowUnbanModal(false)}>Cancel</Button>
                    <Button 
                        variant="warning" 
                        onClick={handleUnbanUser}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Processing...' : 'Confirm Unban'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReportedPosts;