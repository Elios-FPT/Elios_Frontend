// file: elios_FE/src/context/AppContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "../api/apiConfig";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null); // We will use this state for the fetched user
    const [theme, setTheme] = useState("light");
    // const [currentUser, setCurrentUser] = useState(null); // This is now redundant

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get(API_ENDPOINTS.GET_USER_PROFILE, {
                    withCredentials: true,
                    headers: { "Content-Type": "application/json" },
                });
                
                const userData = response.data.data; 
                
                setUser(userData); 
                
                localStorage.setItem("user", JSON.stringify(userData));

            } catch (error) {
                console.error("Error fetching current user:", error);
                
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            }
        }
        
        fetchCurrentUser();

    }, []); // Empty dependency array ensures this runs once on app load

    const value = {
        user,
        setUser,
        theme,
        setTheme
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};