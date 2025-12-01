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
    
    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10; // Default items per page

    const postType = "Post";

    // Reset page to 1 when category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [CategoryId]);

    // Updated: Fetch posts whenever CategoryId or currentPage changes
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                // Assuming backend uses 0-based indexing for pages (based on your response snippet "page": 0)
                // If backend is 1-based, remove the "- 1"
                const apiPage = currentPage > 0 ? currentPage - 1 : 0;

                const response = await axios.get(API_ENDPOINTS.GET_SOLUTION, {
                    params: {
                        PostType: postType,
                        CategoryId: CategoryId,
                        page: apiPage,
                        pageSize: pageSize 
                    },
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });
                setPosts(response.data.responseData || []);
                
                // Update pagination data
                if (response.data.pagination) {
                    setTotalPages(response.data.pagination.totalPages);
                }
            } catch (error) {
                console.error("Error fetching posts:", error);
                setPosts([]); 
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [CategoryId, currentPage]); 

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
        <ForumContext.Provider value={{ 
            posts, 
            categories, 
            loading, 
            setCategoryId,
            currentPage,
            setCurrentPage,
            totalPages
        }}>
            {children}
        </ForumContext.Provider>
    );
};