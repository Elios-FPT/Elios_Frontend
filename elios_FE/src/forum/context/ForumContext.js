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
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const pageSize = 10; 

    const postType = "Post";

    useEffect(() => {
        setCurrentPage(1);
    }, [CategoryId]);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                // CHANGE 1: Use currentPage directly if the backend is 1-based.
                // If your backend specifically requires 0-based, change this back to currentPage - 1.
                const apiPage = currentPage; 

                // Debugging: Check your console to see exactly what is being sent
                console.log(`Fetching Page: ${apiPage}, Category: ${CategoryId}`);

                const response = await axios.get(API_ENDPOINTS.GET_SOLUTION, {
                    params: {
                        PostType: postType,
                        CategoryId: CategoryId,
                        // CHANGE 2: Ensure these keys match your C# DTO (often PascalCase)
                        Page: apiPage, 
                        PageSize: pageSize 
                    },
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });
                
                setPosts(response.data.responseData || []);
                
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