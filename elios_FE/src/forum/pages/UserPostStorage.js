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
    const [error, setError] = useState(null);
    const [banInfo, setBanInfo] = useState(null);

    // Hardcoded values
    const CATEGORY_ID = "8cf071b9-ea2e-4a19-865e-28ec04a26ba7";
    const POST_TYPE = "Post";
    const TITLE = "Your Post Title";
    const CONTENT = "Your post content goes here...";

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch posts and ban status in parallel
                const [postsResponse, banResponse] = await Promise.all([
                    axios.get(API_ENDPOINTS.GET_MY_POSTS, {
                        params: { PostType: POST_TYPE },
                        withCredentials: true,
                        headers: { "Content-Type": "application/json" }
                    }),
                    axios.get(API_ENDPOINTS.GET_MY_BANNED_STATUS, {
                        withCredentials: true
                    })
                ]);

                setUserPosts(postsResponse.data.responseData);
                
                if (banResponse.data && banResponse.data.responseData) {
                    setBanInfo(banResponse.data.responseData);
                }

            } catch (error) {
                console.error("Error fetching data:", error);
                setError("Failed to fetch data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleCreateNewPost = async (e) => {
        e.preventDefault();
        
        // Prevent creation if banned
        if (banInfo && banInfo.isBanned) {
            alert("You cannot create posts while banned.");
            return;
        }

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
            const response = await axios.post(API_ENDPOINTS.GET_POSTS_FORUM, postData, {
                withCredentials: true,
            });

            const newPost = response.data.message;
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
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    };

    const renderBanNotification = () => {
        if (!banInfo || !banInfo.isBanned) return null;

        const banDate = new Date(banInfo.banUntil).toLocaleString();
        const message = banInfo.isPermanent 
            ? "You are permanently banned from posting." 
            : `You are banned until ${banDate}.`;

        return (
            <div id="user-post-storage-ban-notification">
                <div id="ban-notification-icon">⚠️</div>
                <div id="ban-notification-content">
                    <strong>Account Suspended</strong>
                    <span>{message}</span>
                    {banInfo.reason && <span className="ban-reason">Reason: {banInfo.reason}</span>}
                </div>
            </div>
        );
    };

    return (
        <div id="user-post-storage-page">
            <UserNavbar />
            <div id="user-post-storage-background">
                <div id="user-post-storage-container">
                    
                    {renderBanNotification()}

                    <div id="user-post-storage-header">
                        <h1 id="user-post-storage-title">Your Post Storage</h1>
                        <button
                            id="user-post-storage-create-btn"
                            onClick={handleCreateNewPost}
                            disabled={banInfo?.isBanned}
                            title={banInfo?.isBanned ? "You are banned from creating posts" : "Create New Post"}
                            style={banInfo?.isBanned ? { opacity: 0.5, cursor: 'not-allowed', backgroundColor: '#555' } : {}}
                        >
                            Create New Post
                        </button>
                    </div>

                    {error && <p className="user-post-storage-error">{error}</p>}

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
                                    onDelete={handleDeletePost}
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