// file: elios_FE/src/admin/components/forumComponents/AdminManageCategoryCard.js
import React, { useState } from "react";
import '../styles/AdminManageCategoryCard.css';

const AdminManageCategoryCard = ({ category, onUpdate, onDelete }) => {
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
            setError("Failed to save changes. Please try again.");
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
                    {category.isActive ? "Active" : "Inactive"}
                </span>
                <h3>{category.name}</h3>
                <p>{category.description || "No description provided."}</p>
                <small>Slug: {category.slug}</small>
            </div>
            <div className="card-actions">
                <button onClick={handleEditToggle} className="btn-edit">Edit</button>
                <button onClick={handleDelete} className="btn-delete">Delete</button>
            </div>
        </>
    );

    const renderEditMode = () => (
        <>
            <form className="card-edit-form">
                <div className="form-group">
                    <label htmlFor={`name-${category.categoryId}`}>Name</label>
                    <input
                        type="text"
                        id={`name-${category.categoryId}`}
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor={`desc-${category.categoryId}`}>Description</label>
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
                    <label htmlFor={`active-${category.categoryId}`}>Is Active</label>
                </div>
                
                {error && <p className="card-error">{error}</p>}
            </form>
            <div className="card-actions">
                <button onClick={handleSave} className="btn-save" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button onClick={handleCancel} className="btn-cancel" disabled={isSubmitting}>
                    Cancel
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

export default AdminManageCategoryCard;