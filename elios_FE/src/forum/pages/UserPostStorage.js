// file: elios_FE/src/forum/pages/UserPostStorage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import UserPostStorageCard from "../components/UserPostStorageCard";
import UserNavbar from "../../components/navbars/UserNavbar";
import "../style/UserPostStorage.css";
import LoadingCircle1 from "../../components/loading/LoadingCircle1";

const UserPostStorage = () => {
    const navigate = useNavigate();
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // <-- ADDED THIS STATE

    // Hardcoded values
    const CATEGORY_ID = "8cf071b9-ea2e-4a19-865e-28ec04a26ba7";
    const POST_TYPE = "Post";
    const TITLE = "Your Post Title"; // Title for the new draft
    const CONTENT = "Your post content goes here..."; // Content for the new draft

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.GET_MY_POSTS, {
                    params: { PostType: POST_TYPE },
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" }
                });


                setUserPosts(response.data.responseData);

            } catch (error) {
                console.error("Error fetching posts:", error);
                setError("Failed to fetch your posts."); // <-- SET ERROR ON FAIL
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, []);

    const handleCreateNewPost = async (e) => {
        e.preventDefault();
        setError(null);

        const postData = {
            categoryId: CATEGORY_ID,
            title: TITLE,
            content: CONTENT,
            postType: POST_TYPE,
            referenceId: null,
            tags: null,
            submitForReview: false
        };

        try {
            // Use POST to the base /posts endpoint to CREATE
            const response = await axios.post(API_ENDPOINTS.GET_POSTS_FORUM, postData, {
                withCredentials: true,
            });

            // Get the new post ID from the response
            const newPost = response.data.message;

            console.log(newPost);
            // Navigate to the edit page for the new post
            navigate(`/forum/my-posts/edit/${newPost}`);


        } catch (error) {
            console.error("Error creating new post:", error.response || error);
            setError("Failed to create new post. Please try again.");
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(API_ENDPOINTS.DELETE_MY_POST(postId), {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            setUserPosts(prevPosts =>
                prevPosts.filter(post => post.postId !== postId)
            );
            console.log("Post deleted:", postId);
        } catch (error) {
            console.error("Error deleting post:", error);
            // Re-throw so the card can handle its own error state if needed
            throw error;
        }
    };

    return (
        <div id="user-post-storage-page">
            <UserNavbar />
            <div id="user-post-storage-background">
                <div id="user-post-storage-container">

                    {/* --- NEW/MODIFIED JSX --- */}
                    {/* This header wraps the title and the new button */}
                    <div id="user-post-storage-header">
                        <h1 id="user-post-storage-title">Your Post Storage</h1>
                        <button
                            id="user-post-storage-create-btn"
                            onClick={handleCreateNewPost}
                        >
                            Create New Post
                        </button>
                    </div>

                    {/* Display any errors here */}
                    {error && <p className="user-post-storage-error">{error}</p>}
                    {/* --- END OF NEW/MODIFIED JSX --- */}

                    <div id="user-post-storage-list">
                        {loading ? (
                            <div id="user-post-storage-loading">
                                <LoadingCircle1 />
                            </div>
                        ) : (
                            userPosts.map((post) => (
                                <UserPostStorageCard
                                    key={post.postId}
                                    post={post}
                                    onDelete={handleDeletePost} // Pass the handler
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserPostStorage;