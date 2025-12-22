// file: elios_FE/src/user/components/EditProfile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'; // Import Icons

const EditProfile = ({ profile, onProfileUpdate }) => {
    const [editForm, setEditForm] = useState({
        firstName: '',
        lastName: '',
        gender: '',
        dateOfBirth: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null); 
    const [success, setSuccess] = useState(null); // New state for success message

    useEffect(() => {
        if (profile) {
            setEditForm({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                gender: profile.gender || '',
                dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
            });
        }
    }, [profile]);

    const handleSaveProfile = async () => {
        setSaving(true);
        setError(null);
        setSuccess(null);

        // --- VALIDATION: Date of Birth ---
        if (editForm.dateOfBirth) {
            const selectedDate = new Date(editForm.dateOfBirth);
            const today = new Date();
            today.setHours(0, 0, 0, 0); 
            
            if (selectedDate > today) {
                setError("Ngày sinh không được lớn hơn ngày hiện tại.");
                setSaving(false);
                return;
            }
        }

        try {
            const payload = {
                id: localStorage.getItem('userId'),
                firstName: editForm.firstName.trim(),
                lastName: editForm.lastName.trim(),
                gender: editForm.gender === "" ? null : editForm.gender,
                dateOfBirth: editForm.dateOfBirth ? new Date(editForm.dateOfBirth).toISOString() : null
            };

            await axios.put(API_ENDPOINTS.UPDATE_USER, payload, { withCredentials: true });
            
            onProfileUpdate(payload);
            setSuccess('Cập nhật hồ sơ thành công!'); // Show success notification
        } catch (err) {
            console.error(err);
            if (err.response && err.response.data && err.response.data.message) {
                const rawMessage = err.response.data.message;
                setError(rawMessage); 
            } else {
                setError("Có lỗi xảy ra trong quá trình cập nhật. Vui lòng thử lại.");
            }
        } finally {
            setSaving(false);
        }
    };

    const renderErrorContent = () => {
        if (!error) return null;
        if (error.includes(';')) {
            const errors = error.split(';').map(e => e.trim()).filter(e => e);
            return (
                <div className="error-content">
                    <strong>Vui lòng kiểm tra lại:</strong>
                    <ul>
                        {errors.map((err, index) => <li key={index}>{err}</li>)}
                    </ul>
                </div>
            );
        }
        return <span className="error-content">{error}</span>;
    };

    return (
        <div className="edit-profile-container">
            <h2 className="section-title">Chỉnh sửa hồ sơ</h2>
            
            <div className="edit-profile-card">
                {/* --- Success Notification --- */}
                {success && (
                    <div className="success-notification">
                        <FiCheckCircle className="success-icon" />
                        <span>{success}</span>
                    </div>
                )}

                {/* --- Error Notification --- */}
                {error && (
                    <div className="error-notification">
                        <FiAlertCircle className="error-icon" />
                        {renderErrorContent()}
                    </div>
                )}

                <div className="edit-form-grid">
                    <div className="form-group">
                        <label>Họ</label>
                        <input
                            type="text"
                            value={editForm.firstName}
                            onChange={e => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                            placeholder="Nhập họ"
                        />
                    </div>
                    <div className="form-group">
                        <label>Tên</label>
                        <input
                            type="text"
                            value={editForm.lastName}
                            onChange={e => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                            placeholder="Nhập tên"
                        />
                    </div>
                    <div className="form-group">
                        <label>Giới tính</label>
                        <select
                            value={editForm.gender}
                            onChange={e => setEditForm(prev => ({ ...prev, gender: e.target.value }))}
                        >
                            <option value="">Chọn giới tính</option>
                            <option value="MALE">Nam</option>
                            <option value="FEMALE">Nữ</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Ngày sinh</label>
                        <input
                            type="date"
                            value={editForm.dateOfBirth}
                            onChange={e => setEditForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="edit-actions">
                    <button className="btn-confirm" onClick={handleSaveProfile} disabled={saving}>
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditProfile;