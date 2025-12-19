// file: elios_FE/src/forumModerator/pages/MonitorPosts.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button, Form, Spinner, Pagination } from 'react-bootstrap';
import { API_ENDPOINTS } from '../../api/apiConfig';
import PostPreviewModal from '../components/PostPreviewModal';
import '../styles/MonitorPosts.css';

const MonitorPosts = () => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10;

    // Modals
    const [selectedPost, setSelectedPost] = useState(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    
    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.GET_CATEGORIES_FORUM, {
                    withCredentials: true
                });
                setCategories(response.data.responseData || []);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch Posts (Optimized: No longer depends on searchTerm)
    const fetchPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const apiPage = currentPage > 0 ? currentPage - 1 : 0; 

            const params = {
                page: apiPage,
                pageSize: pageSize,
                PostType: 'Post' 
            };

            if (selectedCategory) {
                params.CategoryId = selectedCategory;
            }
            
            // REMOVED: Backend search param (SearchKeyword) to support frontend-only search

            const response = await axios.get(API_ENDPOINTS.GET_POSTS_FORUM, {
                params: params,
                withCredentials: true,
            });

            setPosts(response.data.responseData || []);
            if (response.data.pagination) {
                setTotalPages(response.data.pagination.totalPages);
            }
        } catch (err) {
            console.error("Error fetching posts:", err);
            setError("Không thể tải danh sách bài viết.");
        } finally {
            setLoading(false);
        }
    }, [currentPage, selectedCategory]); // Removed searchTerm dependency

    // Initial fetch
    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Handle Manual Refresh
    const handleRefresh = () => {
        fetchPosts();
    };

    // Handle Delete (Optimized: Updates state directly)
    const handleDelete = async (postId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác.")) {
            return;
        }

        try {
            await axios.delete(
                API_ENDPOINTS.MODERATOR_DELETE_POST(postId),
                {
                    data: { reason: "Inappropriate content" },
                    withCredentials: true
                }
            );

            // OPTIMIZATION: Update state locally instead of refetching
            setPosts(currentPosts => currentPosts.filter(p => p.postId !== postId));
            alert("Đã xóa bài viết thành công.");
            
        } catch (err) {
            console.error("Error deleting post:", err);
            alert("Xóa bài viết thất bại.");
        }
    };

    const handlePreview = (post) => {
        setSelectedPost(post);
        setShowPreviewModal(true);
    };

    // Calculate Filtered Posts (Frontend Search)
    const filteredPosts = posts.filter(post => {
        if (!searchTerm) return true;
        const lowerTerm = searchTerm.toLowerCase();
        return (
            post.title?.toLowerCase().includes(lowerTerm) || 
            post.authorFullName?.toLowerCase().includes(lowerTerm)
        );
    });

    return (
        <div id="monitor-posts-page">
            <div className="page-header">
                <h1>Quản lý toàn bộ bài viết</h1>
                <p>Tìm kiếm, theo dõi và quản lý các bài viết đang hiển thị trên diễn đàn.</p>
            </div>

            {/* Filters Bar */}
            <div id="monitor-filters-container">
                <div className="d-flex gap-3 align-items-center w-100">
                    <Form.Group className="flex-grow-1">
                        <Form.Control
                            type="text"
                            placeholder="Tìm kiếm nhanh (Frontend)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="dark-input"
                        />
                    </Form.Group>

                    <Form.Group style={{ minWidth: '200px' }}>
                        <Form.Select 
                            value={selectedCategory}
                            onChange={(e) => {
                                setSelectedCategory(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="dark-select"
                        >
                            <option value="">Tất cả danh mục</option>
                            {categories.map(cat => (
                                <option key={cat.categoryId} value={cat.categoryId}>
                                    {cat.name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Refresh Button */}
                    <Button variant="secondary" onClick={handleRefresh}>
                        Làm mới
                    </Button>
                </div>
            </div>

            {/* Posts Table */}
            <div className="table-responsive dark-table-container mt-4">
                {loading ? (
                    <div className="text-center p-5">
                        <Spinner animation="border" variant="light" />
                    </div>
                ) : error ? (
                    <p className="text-danger text-center p-4">{error}</p>
                ) : filteredPosts.length === 0 ? (
                    <p className="text-muted text-center p-4">
                        {searchTerm ? "Không tìm thấy kết quả phù hợp." : "Không có bài viết nào."}
                    </p>
                ) : (
                    <table className="table table-dark table-hover" id="monitor-posts-table">
                        <thead>
                            <tr>
                                <th>Tiêu đề</th>
                                <th>Tác giả</th>
                                <th>Danh mục</th>
                                <th>Ngày đăng</th>
                                <th>Thống kê</th>
                                <th className="text-end">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPosts.map(post => (
                                <tr key={post.postId}>
                                    <td style={{ maxWidth: '300px' }}>
                                        <div className="text-truncate fw-bold" title={post.title}>
                                            {post.title}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <img 
                                                src={post.authorAvatarUrl || '/default-avatar.png'} 
                                                alt="avatar" 
                                                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                            />
                                            <span>{post.authorFullName}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge bg-secondary">{post.categoryName}</span>
                                    </td>
                                    <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <div className="post-stats-small">
                                            <span title="Views">👁️ {post.viewsCount}</span>
                                            <span title="Comments" className="ms-2">💬 {post.commentCount}</span>
                                        </div>
                                    </td>
                                    <td className="text-end">
                                        <Button 
                                            variant="outline-info" 
                                            size="sm" 
                                            className="me-2"
                                            onClick={() => handlePreview(post)}
                                        >
                                            Xem
                                        </Button>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => handleDelete(post.postId)}
                                        >
                                            Xóa
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

            {/* Preview Modal */}
            <PostPreviewModal 
                show={showPreviewModal}
                onHide={() => setShowPreviewModal(false)}
                post={selectedPost}
            />
        </div>
    );
};

export default MonitorPosts;