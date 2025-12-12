// src/admin/pages/ReportedPosts.js
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { API_ENDPOINTS } from '../../api/apiConfig';
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
            setError('Không thể tải danh sách báo cáo.'); // Translated
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
            setBanReason(`Bị cấm do báo cáo: ${selectedReport.reason}`); // Translated
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

            // Translated alert logic
            const statusMsg = status === 'Approved' ? 'đã được duyệt' : 'đã bị từ chối';
            alert(`Báo cáo ${statusMsg} thành công.`);
            setShowDetailModal(false);
            fetchReports(); // Refresh list
        } catch (error) {
            console.error("Error resolving report:", error);
            alert("Không thể xử lý báo cáo."); // Translated
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

            alert(`Người dùng ${selectedReport.targetAuthorFirstName} đã bị cấm.`); // Translated
            setShowBanModal(false);
            setShowDetailModal(false);
            fetchReports();
        } catch (err) {
            console.error("Error banning user:", err);
            alert("Không thể cấm người dùng."); // Translated
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
            <h1>Nội dung bị báo cáo</h1> {/* Translated */}
            <p>Xem xét và kiểm duyệt các bài viết và bình luận bị báo cáo.</p> {/* Translated */}

            <div className="filters-container">
                <div className="filter-group">
                    <label>Trạng thái:</label> {/* Translated */}
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="All">Tất cả</option> {/* Translated */}
                        <option value="Pending">Chờ xử lý</option> {/* Translated */}
                        <option value="Approved">Đã duyệt (Đã xử lý)</option> {/* Translated */}
                        <option value="Rejected">Đã từ chối</option> {/* Translated */}
                    </select>
                </div>
                <div className="filter-group">
                    <label>Loại:</label> {/* Translated */}
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="All">Tất cả</option> {/* Translated */}
                        <option value="Post">Bài viết</option> {/* Translated */}
                        <option value="Comment">Bình luận</option> {/* Translated */}
                    </select>
                </div>
                <button className="btn-refresh" onClick={fetchReports}>Làm mới</button> {/* Translated */}
            </div>

            <div className="reports-table-container">
                {loading ? (
                    <div className="text-center p-4"><Spinner animation="border" variant="light" /></div>
                ) : error ? (
                    <p className="error-msg">{error}</p>
                ) : filteredReports.length === 0 ? (
                    <p>Không tìm thấy báo cáo nào phù hợp.</p> // Translated
                ) : (
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>Người dùng bị báo cáo</th> {/* Translated */}
                                <th>Mục tiêu</th> {/* Translated */}
                                <th>Lý do</th> {/* Translated */}
                                <th>Đoạn nội dung</th> {/* Translated */}
                                <th>Trạng thái</th> {/* Translated */}
                                <th>Ngày</th> {/* Translated */}
                                <th>Hành động</th> {/* Translated */}
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
                                            Xem chi tiết {/* Translated */}
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
                        <Modal.Title>Chi tiết báo cáo</Modal.Title> {/* Translated */}
                    </Modal.Header>
                    <Modal.Body className="modal-body-custom">
                        {detailLoading ? (
                            <div className="loading-container">
                                <Spinner animation="border" variant="success" />
                                <p>Đang tải chi tiết đầy đủ...</p> {/* Translated */}
                            </div>
                        ) : (
                            <>
                                {/* 1. The Reported User */}
                                <div className="detail-section">
                                    <h5>Người dùng bị báo cáo (Tác giả)</h5> {/* Translated */}
                                    <div className="detail-user-card">
                                        <img
                                            src={selectedReport.targetAuthorAvatarUrl || 'default-avatar.png'}
                                            alt="Author"
                                            className="detail-avatar"
                                        />
                                        <div>
                                            <h6>{selectedReport.targetAuthorFirstName} {selectedReport.targetAuthorLastName}</h6>
                                            <small className="text-muted">ID: {selectedReport.targetAuthorId}</small>
                                            {selectedReport.isBanned && <span className="badge bg-danger ms-2">Đã bị cấm</span>} {/* Translated */}
                                        </div>
                                        <div className="ms-auto d-flex gap-2">
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={handleOpenBanModal}
                                            >
                                                Cấm người dùng {/* Translated */}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* 2. The Content */}
                                <div className="detail-section">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <h5>Nội dung bị báo cáo ({selectedReport.targetType})</h5> {/* Translated */}

                                        {/* Updated to check logic and use new handler */}
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleRedirectToReportedPosts}
                                        >
                                            Xem bài viết {/* Translated */}
                                        </Button>
                                    </div>

                                    <div className="detail-content-box">
                                        {/* Show detail if available, else fallback to snippet or ID */}
                                        {selectedReport.targetContentDetail || selectedReport.targetContentSnippet || `ID: ${selectedReport.targetId}`}
                                    </div>
                                </div>

                                {/* 3. The Report Info */}
                                <div className="detail-section">
                                    <h5>Thông tin báo cáo</h5> {/* Translated */}
                                    <p><strong>Lý do:</strong> {selectedReport.reason}</p> {/* Translated */}
                                    {selectedReport.details && <p><strong>Chi tiết:</strong> {selectedReport.details}</p>} {/* Translated */}
                                    <p><strong>Người báo cáo:</strong> {selectedReport.reporterFirstName} {selectedReport.reporterLastName}</p> {/* Translated */}
                                    <p><strong>Ngày:</strong> {new Date(selectedReport.createdAt).toLocaleString()}</p> {/* Translated */}
                                </div>

                                {/* 4. Resolution Actions (Only if Pending) */}
                                {selectedReport.status === 'Pending' && (
                                    <div className="detail-section resolution-section mt-4 pt-3 border-top border-secondary">
                                        <h5>Giải quyết</h5> {/* Translated */}
                                        <Form.Group className="mb-3">
                                            <Form.Label>Ghi chú của kiểm duyệt viên</Form.Label> {/* Translated */}
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                value={moderatorNote}
                                                onChange={(e) => setModeratorNote(e.target.value)}
                                                placeholder="Thêm ghi chú về quyết định này (tùy chọn)..." // Translated
                                                className="bg-dark text-white border-secondary"
                                            />
                                        </Form.Group>
                                        <div className="d-flex gap-2 justify-content-end">
                                            <Button
                                                variant="secondary"
                                                onClick={() => handleResolveReport('Rejected', false)}
                                                disabled={isSubmitting}
                                            >
                                                Bỏ qua báo cáo (Giữ nội dung) {/* Translated */}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleResolveReport('Approved', true)}
                                                disabled={isSubmitting}
                                            >
                                                Duyệt báo cáo & Xóa nội dung {/* Translated */}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </Modal.Body>
                    <Modal.Footer className="modal-footer-custom">
                        <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                            Đóng {/* Translated */}
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
                    <Modal.Title>Cấm người dùng</Modal.Title> {/* Translated */}
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    <p>Bạn sắp cấm người dùng <strong>{selectedReport?.targetAuthorFirstName} {selectedReport?.targetAuthorLastName}</strong>.</p> {/* Translated */}
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Lý do cấm</Form.Label> {/* Translated */}
                            <Form.Control
                                type="text"
                                placeholder="Nhập lý do..." // Translated
                                value={banReason}
                                onChange={(e) => setBanReason(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Thời hạn</Form.Label> {/* Translated */}
                            <Form.Select
                                value={banDuration}
                                onChange={(e) => setBanDuration(e.target.value)}
                            >
                                <option value="1">1 Ngày</option> {/* Translated */}
                                <option value="3">3 Ngày</option> {/* Translated */}
                                <option value="7">7 Ngày</option> {/* Translated */}
                                <option value="30">30 Ngày</option> {/* Translated */}
                                <option value="365">1 Năm</option> {/* Translated */}
                                <option value="permanent">Vĩnh viễn</option> {/* Translated */}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <Button variant="secondary" onClick={() => setShowBanModal(false)}>Hủy</Button> {/* Translated */}
                    <Button
                        variant="danger"
                        onClick={handleBanUser}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Xác nhận cấm'} {/* Translated */}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReportedPosts;