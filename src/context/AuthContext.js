// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react'; // Import useEffect

// Key to use for storing user data in sessionStorage
const USER_STORAGE_KEY = 'pwa-auth-user';

// 1. Create the context
const AuthContext = createContext(null);

// Helper function to get initial state from sessionStorage
const getInitialAuthState = () => {
    try {
        const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
            // Parse the stored JSON string back into an object
            return JSON.parse(storedUser);
        }
    } catch (error) {
        console.error("Error reading user from sessionStorage", error);
        // If error parsing, remove the potentially corrupted item
        sessionStorage.removeItem(USER_STORAGE_KEY);
    }
    // If nothing found or error occurred, return null (logged out)
    return null;
};


// 2. Create the Provider component
export const AuthProvider = ({ children }) => {
    // Initialize state by calling the helper function
    const [user, setUser] = useState(getInitialAuthState);

    // NEW: Effect to update sessionStorage whenever user state changes
    // This ensures consistency if state is updated elsewhere, although
    // login/logout are the primary places.
    useEffect(() => {
        try {
            if (user) {
                // Store the user object as a JSON string
                sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
                 console.log('[AuthContext Effect] User saved to sessionStorage:', user);
            } else {
                // If user is null (logged out), remove the item
                sessionStorage.removeItem(USER_STORAGE_KEY);
                 console.log('[AuthContext Effect] User removed from sessionStorage.');
            }
        } catch (error) {
            console.error("Error updating sessionStorage", error);
        }
    }, [user]); // Run this effect whenever the user state changes

    // Login function (updates state, which triggers the useEffect)
    const login = (userData) => {
        // Construct the user object you want to store
        const userToStore = { email: userData.email, name: 'Advisor Name' }; // Example
        setUser(userToStore); // Update React state
        // The useEffect will handle saving to sessionStorage
        console.log('[AuthContext] Login function called. User state set to:', userToStore);
    };

    // Logout function (updates state, which triggers the useEffect)
    const logout = () => {
        setUser(null); // Update React state to null
        // The useEffect will handle removing from sessionStorage
        console.log('[AuthContext] Logout function called. User state set to null.');
    };

    // The value provided (isAuthenticated is derived directly from user state)
    const value = {
        user,
        isAuthenticated: !!user, // True if user object exists, false if null
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Custom hook (remains the same)
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};