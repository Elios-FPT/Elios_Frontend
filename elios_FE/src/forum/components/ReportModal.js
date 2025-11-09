// file: elios_FE/src/forum/components/ReportModal.js
import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ReportModal = ({ show, handleClose, handleSubmit }) => {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');

    const onSubmit = (e) => {
        e.preventDefault();
        if (!reason) {
            alert("Please select a reason for the report.");
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
        handleClose();
    }

    return (
        <Modal show={show} onHide={onCancel} centered>
            <Modal.Header closeButton>
                <Modal.Title>Report Content</Modal.Title>
            </Modal.Header>
            <Form onSubmit={onSubmit}>
                <Modal.Body>
                    <Form.Group className="mb-3" controlId="reportReason">
                        <Form.Label>Reason</Form.Label>
                        <Form.Select 
                            aria-label="Select a reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        >
                            <option value="">Select a reason...</option>
                            <option value="Spam or Advertising">Spam or Advertising</option>
                            <option value="Harassment or Bullying">Harassment or Bullying</option>
                            <option value="Hate Speech or Discrimination">Hate Speech or Discrimination</option>
                            <option value="Misinformation or Fake News">Misinformation or Fake News</option>
                            <option value="Offensive or Inappropriate Content">Offensive or Inappropriate Content</option>
                            <option value="Other">Other</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="reportDetails">
                        <Form.Label>Details (Optional)</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Provide any additional information here..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button variant="danger" type="submit">
                        Submit Report
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default ReportModal;