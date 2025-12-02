// elios_FE/src/admin/pages/forum/pages/BannedUserForum.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Table, Badge, Button, Pagination, Modal, Form, Spinner } from "react-bootstrap";
import { API_ENDPOINTS } from "../../../../api/apiConfig";
import "../styles/BannedUserForum.css";

const BannedUserForum = () => {
    const [bannedUsers, setBannedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    // Filter State
    const [filterStatus, setFilterStatus] = useState('All'); // All, Active, Inactive

    // Unban Modal State
    const [showUnbanModal, setShowUnbanModal] = useState(false);
    const [selectedBan, setSelectedBan] = useState(null);
    const [unbanReason, setUnbanReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchBannedUsers = useCallback(async () => {
        setLoading(true);
        try {
            // Adjust params based on your backend pagination requirement (0-based or 1-based)
            const apiPage = currentPage > 0 ? currentPage - 1 : 0;
            
            const response = await axios.get(API_ENDPOINTS.BAN_USER, {
                params: {
                    page: apiPage,
                    pageSize: pageSize,
                    // If your API supports filtering by status, add it here. 
                    // Otherwise, we filter client-side (less efficient for pagination).
                },
                withCredentials: true,
            });

            const data = response.data;
            if (data && data.responseData) {
                setBannedUsers(data.responseData);
                if (data.pagination) {
                    setTotalPages(data.pagination.totalPages);
                }
            }
        } catch (error) {
            console.error("Error fetching banned users:", error);
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchBannedUsers();
    }, [fetchBannedUsers]);

    // Handle Unban
    const handleOpenUnbanModal = (ban) => {
        setSelectedBan(ban);
        setUnbanReason('');
        setShowUnbanModal(true);
    };

    const handleUnbanUser = async () => {
        if (!selectedBan) return;
        setIsSubmitting(true);
        try {
            // Using the API endpoint structure from your previous context
            await axios.put(API_ENDPOINTS.UN_BAN_USER(selectedBan.id), {
                unbanReason: unbanReason
            }, {
                withCredentials: true
            });
            
            setShowUnbanModal(false);
            fetchBannedUsers(); // Refresh list
        } catch (error) {
            console.error('Error unbanning user:', error);
            alert("Failed to unban user.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Client-side filtering wrapper (if API doesn't support filter params)
    const getFilteredUsers = () => {
        if (filterStatus === 'All') return bannedUsers;
        if (filterStatus === 'Active') return bannedUsers.filter(u => u.isActive);
        if (filterStatus === 'Inactive') return bannedUsers.filter(u => !u.isActive);
        return bannedUsers;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div id="banned-users-page">
            <div className="page-header">
                <h1>Banned Users Management</h1>
                <p>Monitor and manage suspended accounts.</p>
            </div>

            {/* Filters */}
            <div className="banned-filters">
                <div className="filter-group">
                    <label>Status:</label>
                    <select 
                        value={filterStatus} 
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="dark-select"
                    >
                        <option value="All">All History</option>
                        <option value="Active">Active Bans Only</option>
                        <option value="Inactive">Expired/Unbanned</option>
                    </select>
                </div>
                <Button variant="secondary" size="sm" onClick={fetchBannedUsers} className="ms-auto">
                    Refresh
                </Button>
            </div>

            {/* Table */}
            <div className="table-responsive dark-table-container">
                {loading ? (
                    <div className="text-center p-5">
                        <Spinner animation="border" variant="success" />
                    </div>
                ) : (
                    <Table hover variant="dark" className="banned-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Reason</th>
                                <th>Banned By</th>
                                <th>Duration</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredUsers().length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted">No records found.</td>
                                </tr>
                            ) : (
                                getFilteredUsers().map((ban) => (
                                    <tr key={ban.id}>
                                        <td>
                                            <div className="d-flex align-items-center gap-3">
                                                <img 
                                                    src={ban.userAvatarUrl || 'default-avatar.png'} 
                                                    alt="avatar" 
                                                    className="banned-avatar"
                                                />
                                                <div className="d-flex flex-column">
                                                    <span className="fw-bold text-gold">{ban.userFirstName} {ban.userLastName}</span>
                                                    <small className="text-muted" style={{fontSize: '0.75rem'}}>ID: {ban.userId.substring(0, 8)}...</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="reason-cell" title={ban.reason}>
                                                {ban.reason}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="text-light">{ban.bannedByFirstName} {ban.bannedByLastName}</span>
                                            <div className="text-muted small">{formatDate(ban.bannedAt)}</div>
                                        </td>
                                        <td>
                                            {ban.isPermanent ? (
                                                <Badge bg="danger">Permanent</Badge>
                                            ) : (
                                                <div className="d-flex flex-column small">
                                                    <span>Until: {formatDate(ban.banUntil)}</span>
                                                    {ban.unbannedAt && <span className="text-success">Unbanned: {formatDate(ban.unbannedAt)}</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td>
                                            {ban.isActive ? (
                                                <Badge bg="danger" className="status-badge">Active</Badge>
                                            ) : (
                                                <Badge bg="secondary" className="status-badge">Inactive</Badge>
                                            )}
                                        </td>
                                        <td>
                                            {ban.isActive && (
                                                <Button 
                                                    variant="warning" 
                                                    size="sm" 
                                                    onClick={() => handleOpenUnbanModal(ban)}
                                                >
                                                    Unban
                                                </Button>
                                            )}
                                            {!ban.isActive && ban.unbanReason && (
                                                <span className="text-muted small fst-italic" title={ban.unbanReason}>
                                                    Reason: {ban.unbanReason.length > 20 ? ban.unbanReason.substring(0,20) + '...' : ban.unbanReason}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination className="dark-pagination">
                        <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                        <Pagination.Item active>{currentPage}</Pagination.Item>
                        <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}

            {/* Unban Modal */}
            <Modal 
                show={showUnbanModal} 
                onHide={() => setShowUnbanModal(false)}
                centered
                className="dark-theme-modal"
            >
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>Lift Ban</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    <p>
                        Are you sure you want to unban 
                        <strong className="text-gold mx-1">
                            {selectedBan?.userFirstName} {selectedBan?.userLastName}
                        </strong>?
                    </p>
                    <Form.Group>
                        <Form.Label>Unban Reason (Optional)</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3}
                            value={unbanReason}
                            onChange={(e) => setUnbanReason(e.target.value)}
                            className="dark-input"
                            placeholder="e.g. Appeal accepted, mistake corrected..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <Button variant="secondary" onClick={() => setShowUnbanModal(false)}>Cancel</Button>
                    <Button 
                        variant="success" 
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
export default BannedUserForum;