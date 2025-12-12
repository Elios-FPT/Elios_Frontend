// file: elios_FE/src/forumModerator/pages/ManageCategory.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import ManageCategoryCard from "../components/ManageCategoryCard";
import '../styles/ManageCategory.css';

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
            const response = await axios.get(API_ENDPOINTS.GET_CATEGORIES_FORUM, {
                withCredentials: true,
            });
            // Assuming the data is in response.data.responseData based on your note.json
            if (response.data && Array.isArray(response.data.responseData)) {
                setCategories(response.data.responseData);
            } else {
                setError("Định dạng phản hồi không mong muốn."); // Translated
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError("Không thể tải danh mục. Vui lòng thử lại."); // Translated
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
            setCreateError("Tạo danh mục thất bại. Kiểm tra console để biết chi tiết."); // Translated
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
            throw new Error("Cập nhật danh mục thất bại."); // Translated
        }
    };

    /**
     * Handles the deletion of a category.
     * This function is passed to the card.
     */
    const handleDelete = async (categoryId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.")) { // Translated
            return;
        }

        try {
            await axios.delete(API_ENDPOINTS.DELETE_CATEGORY(categoryId), {
                withCredentials: true,
            });
            await fetchCategories(); // Refresh the list
        } catch (err) {
            console.error("Error deleting category:", err);
            setError("Xóa danh mục thất bại. Có thể danh mục đang được sử dụng."); // Translated
        }
    };

    return (
        <div id="admin-manage-category-page">
            <h1>Quản lý danh mục diễn đàn</h1> {/* Translated */}

            {/* --- Create New Category Form --- */}
            <form id="create-category-form" onSubmit={handleCreate}>
                <h2>Tạo danh mục mới</h2> {/* Translated */}
                {createError && <p className="form-error">{createError}</p>}
                <div className="form-group">
                    <label htmlFor="newName">Tên danh mục</label> {/* Translated */}
                    <input
                        type="text"
                        id="newName"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="newDescription">Mô tả</label> {/* Translated */}
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
                    <label htmlFor="newIsActive">Đặt là hoạt động</label> {/* Translated */}
                </div>
                <button type="submit" className="btn-create">Tạo danh mục</button> {/* Translated */}
            </form>

            {/* --- Existing Categories List --- */}
            <h2>Danh mục hiện có</h2> {/* Translated */}
            {error && <p className="page-error">{error}</p>}
            
            <div id="category-list-container">
                {loading ? (
                    <p>Đang tải danh mục...</p> // Translated
                ) : categories.length === 0 ? (
                    <p>Không tìm thấy danh mục nào.</p> // Translated
                ) : (
                    categories.map(category => (
                        <ManageCategoryCard
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