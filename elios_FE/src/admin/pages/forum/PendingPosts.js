// src/admin/pages/PendingPosts.js
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../api/apiConfig';
import PostPreviewModal from '../../components/PostPreviewModal';
import '../../styles/PendingPosts.css';

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
            setError('Failed to load posts. Please try again later.');
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
            const reason = window.prompt("Please enter a reason for rejection (required):");

            if (reason === null) {
                return; 
            }
            if (reason.trim() === "") {
                alert("A reason is required to reject a post.");
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
            alert(`Failed to ${action} post.`);
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
            return <div className="loader">Loading posts...</div>;
        }

        if (error) {
            return <div className="error-message">{error}</div>;
        }

        if (posts.length === 0) {
            return <p>No pending posts found.</p>;
        }

        return (
            <table id="pending-posts-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Type</th>
                        <th>Created At</th>
                        <th>Actions</th>
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
                                <button className="btn-preview" onClick={() => handlePreview(post)}>Preview</button>
                                <button className="btn-approve" onClick={() => handleAction(post.postId, 'approve')}>Approve</button>
                                <button className="btn-reject" onClick={() => handleAction(post.postId, 'reject')}>Reject</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div id="pending-posts-container">
            <h1>Pending Forum Posts</h1>
            <p>Here you can review and approve posts submitted by users.</p>

            <form id="pending-posts-controls" onSubmit={handleSearchSubmit}>
                <input
                    type="text"
                    placeholder="Search by title, author, category..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <button type="submit">Search</button>
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