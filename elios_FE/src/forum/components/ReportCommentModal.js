// file: elios_FE/src/forum/components/ReportCommentModal.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import '../style/ReportPostModal.css';

const ReportCommentModal = ({ show, handleClose, handleSubmit }) => {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [error, setError] = useState(''); // New state for error message

    const onSubmit = (e) => {
        e.preventDefault();
        setError(''); // Clear previous error

        if (!reason) {
            setError("Vui lòng chọn lý do báo cáo."); // Translated
            return;
        }
        
        // Pass the reason and details up to the parent
        handleSubmit(reason, details);
        
        // Reset fields and close
        setReason('');
        setDetails('');
        handleClose();
    };

    const onCancel = () => {
        // Reset fields and close
        setReason('');
        setDetails('');
        setError(''); // Clear error on cancel
        handleClose();
    }

    return (
        <Modal 
            show={show} 
            onHide={onCancel} 
            centered
            id="Report-Post-Modal"
            backdropClassName="dark-theme-backdrop"
        >
            <Modal.Header closeButton>
                <Modal.Title>Báo cáo nội dung</Modal.Title> {/* Translated */}
            </Modal.Header>
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    {/* Display error message */}
                    {error && <p className="text-danger">{error}</p>}
                    <Form.Group className="mb-3" controlId="reportReason">
                        <Form.Label>Lý do</Form.Label> {/* Translated */}
                        <Form.Select 
                            aria-label="Select a reason"
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value);
                                if (e.target.value) setError(''); // Clear error when a reason is selected
                            }}
                            required
                        >
                            <option value="">Chọn một lý do...</option> {/* Translated */}
                            {/* Values are kept in English for Backend compatibility, labels translated */}
                            <option value="Spam or Advertising">Spam hoặc Quảng cáo</option>
                            <option value="Harassment or Bullying">Quấy rối hoặc Bắt nạt</option>
                            <option value="Hate Speech or Discrimination">Lời nói thù ghét hoặc Phân biệt đối xử</option>
                            <option value="Misinformation or Fake News">Thông tin sai lệch hoặc Tin giả</option>
                            <option value="Offensive or Inappropriate Content">Nội dung phản cảm hoặc không phù hợp</option>
                            <option value="Other">Khác</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="reportDetails">
                        <Form.Label>Chi tiết (Tùy chọn)</Form.Label> {/* Translated */}
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Cung cấp thêm thông tin tại đây..." // Translated
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onCancel}>
                        Hủy {/* Translated */}
                    </Button>
                    <Button variant="danger" type="submit">
                        Gửi báo cáo {/* Translated */}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ReportCommentModal;