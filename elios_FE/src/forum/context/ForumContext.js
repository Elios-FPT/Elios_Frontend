// FRONT-END: elios_FE/src/forum/context/ForumContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../../api/apiConfig";

export const ForumContext = createContext();

export const ForumContextProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [CategoryId, setCategoryId] = useState(null);
    const [loading, setLoading] = useState(true);

    const postType = "Post";

    // Updated: Fetch posts whenever CategoryId changes
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await axios.get(API_ENDPOINTS.GET_SOLUTION, {
                    params: {
                        PostType: postType,
                        CategoryId: CategoryId,
                    },
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });
                setPosts(response.data.responseData || []);
            } catch (error) {
                console.error("Error fetching posts:", error);
                setPosts([]); // Clear posts on error or empty response
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [CategoryId]); // Dependency ensures re-fetch on category change

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.GET_CATEGORIES_FORUM, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });
                setCategories(response.data.responseData || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        if (!categories || categories.length === 0) {
            fetchCategories();
        }
    }, [categories.length]);

    return (
        // Added setCategoryId to the provider value
        <ForumContext.Provider value={{ posts, categories, loading, setCategoryId }}>
            {children}
        </ForumContext.Provider>
    );
};