// file: elios_FE/src/forumModerator/pages/PendingPosts.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../api/apiConfig';
import PostPreviewModal from '../components/PostPreviewModal'
import '../styles/PendingPosts.css';

const PendingPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // State for modal
    const [selectedPost, setSelectedPost] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchPendingPosts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (searchTerm) {
                params.append('SearchKeyword', searchTerm);
            }
            // You can add more params for sorting/filtering here if needed
            // params.append('Limit', 20); 
            // params.append('Offset', 0);

            const response = await axios.get(API_ENDPOINTS.GET_PENDING_POSTS, {
                params,
                withCredentials: true,
            });
            
            // The actual data is in the responseData property
            setPosts(response.data.responseData || []);
        } catch (err) {
            console.error('Error fetching pending posts:', err);
            setError('Không thể tải bài viết. Vui lòng thử lại sau.'); // Translated
        } finally {
            setLoading(false);
        }
    }, [searchTerm]);

    useEffect(() => {
        fetchPendingPosts();
    }, [fetchPendingPosts]);

    const handleAction = async (postId, action) => {
        let endpoint;
        let method;
        let requestBody = {}; // Body for 'put'
        let requestConfig = { withCredentials: true }; // Base config

        if (action === 'approve') {
            endpoint = API_ENDPOINTS.APPROVE_PENDING_POST(postId); // Assuming this exists
            method = 'put';
        } else if (action === 'reject') {
            const reason = window.prompt("Vui lòng nhập lý do từ chối (bắt buộc):"); // Translated

            if (reason === null) {
                return; 
            }
            if (reason.trim() === "") {
                alert("Bạn cần phải nhập lý do để từ chối bài viết."); // Translated
                return;
            }
            endpoint = API_ENDPOINTS.REJECT_PENDING_POST(postId); // Assuming this exists
            method = 'put';
            
            requestConfig.data = { reason: reason };
          
        } else {
            return; // Should not happen
        }

        // Optimistically update UI (now done after validation)
        setPosts(prevPosts => prevPosts.filter(p => p.postId !== postId));

        try {
            await axios[method](endpoint, requestBody, requestConfig);

        } catch (err) {
            console.error(`Error ${action === 'approve' ? 'approving' : 'rejecting'} post:`, err);
            // Revert UI on failure
            fetchPendingPosts(); 
            // Translated action logic
            const actionText = action === 'approve' ? 'duyệt' : 'từ chối';
            alert(`Thất bại khi ${actionText} bài viết.`);
        }
    };

    const handlePreview = (post) => {
        setSelectedPost(post);
        setIsModalOpen(true);
    };
    
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchPendingPosts();
    };

    const renderContent = () => {
        if (loading) {
            return <div className="loader">Đang tải bài viết...</div>; // Translated
        }

        if (error) {
            return <div className="error-message">{error}</div>;
        }

        if (posts.length === 0) {
            return <p>Không tìm thấy bài viết chờ duyệt nào.</p>; // Translated
        }

        return (
            <table id="pending-posts-table">
                <thead>
                    <tr>
                        <th>Tiêu đề</th> {/* Translated */}
                        <th>Tác giả</th> {/* Translated */}
                        <th>Danh mục</th> {/* Translated */}
                        <th>Loại</th> {/* Translated */}
                        <th>Ngày tạo</th> {/* Translated */}
                        <th>Hành động</th> {/* Translated */}
                    </tr>
                </thead>
                <tbody>
                    {posts.map(post => (
                        <tr key={post.postId}>
                            <td>{post.title}</td>
                            <td>{post.authorFullName}</td>
                            <td>{post.categoryName}</td>
                            <td>{post.postType}</td>
                            <td>{new Date(post.createdAt).toLocaleDateString()}</td>
                            <td className="action-buttons">
                                <button className="btn-preview" onClick={() => handlePreview(post)}>Xem trước</button> {/* Translated */}
                                <button className="btn-approve" onClick={() => handleAction(post.postId, 'approve')}>Duyệt</button> {/* Translated */}
                                <button className="btn-reject" onClick={() => handleAction(post.postId, 'reject')}>Từ chối</button> {/* Translated */}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div id="pending-posts-container">
            <h1>Bài viết diễn đàn chờ duyệt</h1> {/* Translated */}
            <p>Tại đây bạn có thể xem xét và duyệt các bài viết do người dùng gửi lên.</p> {/* Translated */}

            <form id="pending-posts-controls" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tiêu đề, tác giả, danh mục..." // Translated
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button type="submit">Tìm kiếm</button> {/* Translated */}
            </form>

            <div id="posts-list">
                {renderContent()}
            </div>
            
            <PostPreviewModal 
                show={isModalOpen}
                onHide={() => setIsModalOpen(false)}
                post={selectedPost}
            />
        </div>
    );
};

export default PendingPosts;