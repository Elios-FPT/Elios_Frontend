// file: elios_FE/src/forumModerator/components/ManageCategoryCard.js
import React, { useState } from "react";
import '../styles/ManageCategoryCard.css';

const ManageCategoryCard = ({ category, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // State to hold form data during edit
    const [editName, setEditName] = useState(category.name);
    const [editDescription, setEditDescription] = useState(category.description);
    const [editIsActive, setEditIsActive] = useState(category.isActive);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleEditToggle = () => {
        // Enter edit mode
        setIsEditing(true);
        // Reset fields to current category props in case of previous failed edits
        setEditName(category.name);
        setEditDescription(category.description);
        setEditIsActive(category.isActive);
        setError(null);
    };

    const handleCancel = () => {
        // Exit edit mode without saving
        setIsEditing(false);
        setError(null);
    };

    const handleSave = async () => {
        setIsSubmitting(true);
        setError(null);

        const updatedData = {
            name: editName,
            description: editDescription,
            isActive: editIsActive
        };

        try {
            await onUpdate(category.categoryId, updatedData);
            setIsEditing(false); // Exit edit mode on success
        } catch (err) {
            console.error("Save failed:", err);
            setError("Lưu thay đổi thất bại. Vui lòng thử lại."); // Translated
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = () => {
        // Pass the delete action to the parent
        onDelete(category.categoryId);
    };

    const renderViewMode = () => (
        <>
            <div className="card-view-info">
                <span className={`status-badge ${category.isActive ? 'active' : 'inactive'}`}>
                    {category.isActive ? "Hoạt động" : "Không hoạt động"} {/* Translated */}
                </span>
                <h3>{category.name}</h3>
                <p>{category.description || "Chưa có mô tả."}</p> {/* Translated */}
                <small>Slug: {category.slug}</small>
            </div>
            <div className="card-actions">
                <button onClick={handleEditToggle} className="btn-edit">Sửa</button> {/* Translated */}
                <button onClick={handleDelete} className="btn-delete">Xóa</button> {/* Translated */}
            </div>
        </>
    );

    const renderEditMode = () => (
        <>
            <form className="card-edit-form">
                <div className="form-group">
                    <label htmlFor={`name-${category.categoryId}`}>Tên</label> {/* Translated */}
                    <input
                        type="text"
                        id={`name-${category.categoryId}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor={`desc-${category.categoryId}`}>Mô tả</label> {/* Translated */}
                    <textarea
                        id={`desc-${category.categoryId}`}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        rows="4"
                    />
                </div>
                <div className="form-group-checkbox">
                    <input
                        type="checkbox"
                        id={`active-${category.categoryId}`}
                        checked={editIsActive}
                        onChange={(e) => setEditIsActive(e.target.checked)}
                    />
                    <label htmlFor={`active-${category.categoryId}`}>Kích hoạt</label> {/* Translated */}
                </div>
                
                {error && <p className="card-error">{error}</p>}
            </form>
            <div className="card-actions">
                <button onClick={handleSave} className="btn-save" disabled={isSubmitting}>
                    {isSubmitting ? "Đang lưu..." : "Lưu"} {/* Translated */}
                </button>
                <button onClick={handleCancel} className="btn-cancel" disabled={isSubmitting}>
                    Hủy {/* Translated */}
                </button>
            </div>
        </>
    );

    return (
        <div className={`admin-category-card ${!category.isActive ? 'is-inactive' : ''}`}>
            {isEditing ? renderEditMode() : renderViewMode()}
        </div>
    );
};

export default ManageCategoryCard;