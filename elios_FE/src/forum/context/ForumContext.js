// FRONT-END: elios_FE/src/forum/context/ForumContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";

export const ForumContext = createContext();

export const ForumContextProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.GET_POSTS_FORUM, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });
                setPosts(response.data.responseData || []);
            } catch (error) {
                console.error("Error fetching posts:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!posts || posts.length === 0) {
            fetchPosts();
        }
    }, [posts.length]);


    return (
        <ForumContext.Provider value={{ posts, loading }}>
            {children}
        </ForumContext.Provider>
    );
};