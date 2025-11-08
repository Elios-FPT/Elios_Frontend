// file: elios_FE/src/forum/pages/UserPostStorage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";
import UserPostStorageCard from "../components/UserPostStorageCard";
import UserNavbar from "../../components/navbars/UserNavbar";
import "../style/UserPostStorage.css";
import LoadingCircle1 from "../../components/loading/LoadingCircle1";

const UserPostStorage = () => {
    const [userPosts, setUserPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserPosts = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.GET_MY_POSTS, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });

                setUserPosts(response.data.responseData);

            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserPosts();
    }, []);

    // --- MODIFIED ---
    // Handle the deletion logic in the parent component
    const handleDeletePost = async (postId) => {
        try {
            await axios.delete(API_ENDPOINTS.DELETE_MY_POST(postId), {
                withCredentials: true,
                headers: { "Content-Type": "application/json" },
            });

            // On successful deletion, update the state to remove the post
            setUserPosts(prevPosts =>
                prevPosts.filter(post => post.postId !== postId)
            );
            console.log("Post deleted:", postId);
        } catch (error) {
            console.error("Error deleting post:", error);
            // Optionally, re-throw or handle error (e.g., show a notification)
            throw error;
        }
    };

    return (
        <div id="user-post-storage-page">
            <UserNavbar />
            <div id="user-post-storage-background">
                <div id="user-post-storage-container">
                    <h1 id="user-post-storage-title">Your Post Storage</h1>

                    <div id="user-post-storage-list">
                        {loading ? (
                            <div id="user-post-storage-loading">
                                <LoadingCircle1 />
                            </div>
                        ) : (
                            userPosts.map((post) => (
                                // --- MODIFIED ---
                                // Pass the delete handler function as a prop
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