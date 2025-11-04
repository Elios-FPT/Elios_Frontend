// file: elios_FE/src/forum/pages/EditPostForForum.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../../api/apiConfig";
import UserNavbar from "../../components/navbars/UserNavbar";
import '../style/EditPostForForum.css'; // Import the stylesheet

const EditPostForForum = () => {
    const { postId } = useParams();
    const navigate = useNavigate();

    // State for form fields
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    // State for loading and errors
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPostData = async () => {
            if (!postId) return;
            
            setLoading(true);
            setError(null);
            
            try {
                // Use the specified API endpoint
                const response = await axios.get(API_ENDPOINTS.GET_MY_POST_CONTENT(postId), {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });

                if (response.data && response.data.responseData) {
                    const post = response.data.responseData;
                    // Populate the form state with fetched data
                    setTitle(post.title);
                    setContent(post.content);
                } else {
                    setError("Post data not found in response.");
                }

            } catch (err) {
                console.error("Error fetching post data:", err);
                setError("Failed to fetch post. You may not have permission to edit this post or it may not exist.");
            } finally {
                setLoading(false);
            }
        };

        fetchPostData();
    }, [postId]); // Run this effect when postId changes

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Implement the UPDATE/PUT API call
        console.log("Submitting updated post:", { title, content });
        
        // Example of what the update call might look like:
        // try {
        //     await axios.put(API_ENDPOINTS.UPDATE_MY_POST(postId), // You'll need to add this endpoint to apiConfig.js
        //         { title, content }, 
        //         { withCredentials: true }
        //     );
        //     alert("Post updated successfully!");
        //     navigate('/forum/user-posts'); // Redirect back to storage
        // } catch (err) {
        //     console.error("Error updating post:", err);
        //     setError("Failed to update post.");
        // }
    };

    if (loading) {
        return (
            <>
                <UserNavbar />
                <div className="edit-post-container">
                    <p>Loading post data...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <UserNavbar />
                <div className="edit-post-container">
                    <p className="edit-post-error">{error}</p>
                    <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </>
        );
    }

    return (
        <>
            <UserNavbar />
            <div className="edit-post-container">
                <h1>Edit Your Post</h1>
                <form className="edit-post-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="content">Content</label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="15"
                            required
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-save">Save Changes</button>
                        <button type="button" className="btn-cancel" onClick={() => navigate('/forum/user-posts')}>Cancel</button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default EditPostForForum;