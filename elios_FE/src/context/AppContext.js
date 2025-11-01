// file: elios_FE/src/context/AppContext.js
import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
    // Example state you might want in a global context
    const [user, setUser] = useState(null);
    const [theme, setTheme] = useState("light");

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