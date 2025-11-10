// file: elios_FE/src/admin/pages/forum/AdminManageCategory.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../../api/apiConfig";
import AdminManageCategoryCard from "../../components/forumComponents/AdminManageCategoryCard";
import '../../styles/AdminManageCategory.css';

const AdminManageCategory = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for the "Create New" form
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newIsActive, setNewIsActive] = useState(true);
    const [createError, setCreateError] = useState(null);

    /**
     * Fetches all categories from the API.
     */
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(API_ENDPOINTS.GET_CATEGORIES, {
                withCredentials: true,
            });
            // Assuming the data is in response.data.responseData based on your note.json
            if (response.data && Array.isArray(response.data.responseData)) {
                setCategories(response.data.responseData);
            } else {
                setError("Unexpected response format.");
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError("Failed to fetch categories. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    /**
     * Handles creation of a new category.
     */
    const handleCreate = async (e) => {
        e.preventDefault();
        setCreateError(null);
        
        const newCategoryData = {
            name: newName,
            description: newDescription,
            isActive: newIsActive,
        };

        try {
            await axios.post(API_ENDPOINTS.CREATE_CATEGORY, newCategoryData, {
                withCredentials: true,
            });
            
            // Reset form and refetch the list
            setNewName("");
            setNewDescription("");
            setNewIsActive(true);
            await fetchCategories(); // Refresh the list
        } catch (err) {
            console.error("Error creating category:", err);
            setCreateError("Failed to create category. Check console for details.");
        }
    };

    /**
     * Handles the update of an existing category.
     * This function is passed to the card.
     */
    const handleUpdate = async (categoryId, updatedData) => {
        try {
            await axios.put(API_ENDPOINTS.UPDATE_CATEGORY(categoryId), updatedData, {
                withCredentials: true,
            });
            await fetchCategories(); // Refresh the list
        } catch (err) {
            console.error("Error updating category:", err);
            // Re-throw the error so the card can handle its own UI state (e.g., show an error)
            throw new Error("Failed to update category.");
        }
    };

    /**
     * Handles the deletion of a category.
     * This function is passed to the card.
     */
    const handleDelete = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
            return;
        }

        try {
            await axios.delete(API_ENDPOINTS.DELETE_CATEGORY(categoryId), {
                withCredentials: true,
            });
            await fetchCategories(); // Refresh the list
        } catch (err) {
            console.error("Error deleting category:", err);
            setError("Failed to delete category. It might be in use.");
        }
    };

    return (
        <div id="admin-manage-category-page">
            <h1>Manage Forum Categories</h1>

            {/* --- Create New Category Form --- */}
            <form id="create-category-form" onSubmit={handleCreate}>
                <h2>Create New Category</h2>
                {createError && <p className="form-error">{createError}</p>}
                <div className="form-group">
                    <label htmlFor="newName">Name</label>
                    <input
                        type="text"
                        id="newName"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="newDescription">Description</label>
                    <textarea
                        id="newDescription"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows="3"
                    />
                </div>
                <div className="form-group-checkbox">
                    <input
                        type="checkbox"
                        id="newIsActive"
                        checked={newIsActive}
                        onChange={(e) => setNewIsActive(e.target.checked)}
                    />
                    <label htmlFor="newIsActive">Set as Active</label>
                </div>
                <button type="submit" className="btn-create">Create Category</button>
            </form>

            {/* --- Existing Categories List --- */}
            <h2>Existing Categories</h2>
            {error && <p className="page-error">{error}</p>}
            
            <div id="category-list-container">
                {loading ? (
                    <p>Loading categories...</p>
                ) : categories.length === 0 ? (
                    <p>No categories found.</p>
                ) : (
                    categories.map(category => (
                        <AdminManageCategoryCard
                            key={category.categoryId}
                            category={category}
                            onUpdate={handleUpdate}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminManageCategory;