// src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';

// Key names for storage
const USER_STORAGE_KEY = 'pwa-auth-user';
const TOKEN_STORAGE_KEY = 'pwa-auth-token'; // <-- New key for token

// Helper function to get initial state
const getInitialAuthState = () => {
    let user = null;
    let token = null;
    try {
        const storedUser = sessionStorage.getItem(USER_STORAGE_KEY);
        const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedUser && storedToken) {
            user = JSON.parse(storedUser);
            token = storedToken;
            // TODO: Optional: Verify token expiry here? For now, assume valid if present.
            console.log('[AuthContext Init] Found user and token in storage.');
        }
    } catch (error) {
        console.error("Error reading auth state from sessionStorage", error);
        sessionStorage.removeItem(USER_STORAGE_KEY);
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    return { user, token };
};


const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const initialAuthState = getInitialAuthState();
    const [user, setUser] = useState(initialAuthState.user);
    const [token, setToken] = useState(initialAuthState.token); // <-- State for token

    // Login: Stores user AND token
    const login = (userData, receivedToken) => { // <-- Accept token
        if (!userData || !receivedToken) {
            console.error("[AuthContext Login] Missing user data or token");
            return;
        }
        const userToStore = { id: userData.id, email: userData.email, name: userData.name };
        try {
            sessionStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userToStore));
            sessionStorage.setItem(TOKEN_STORAGE_KEY, receivedToken); // <-- Store token
            setUser(userToStore);
            setToken(receivedToken); // <-- Set token state
            console.log('[AuthContext] Login: User and token stored.');
        } catch (error) {
             console.error("Error saving auth state to sessionStorage", error);
        }
    };

    // Logout: Clears user AND token
    const logout = () => {
        try {
            sessionStorage.removeItem(USER_STORAGE_KEY);
            sessionStorage.removeItem(TOKEN_STORAGE_KEY); // <-- Remove token
            setUser(null);
            setToken(null); // <-- Clear token state
            console.log('[AuthContext] Logout: User and token removed.');
        } catch (error) {
             console.error("Error removing auth state from sessionStorage", error);
        }
    };

    // Value provided includes token and a getter function
    const value = {
        user,
        token, // <-- Provide token
        getToken: () => sessionStorage.getItem(TOKEN_STORAGE_KEY), // <-- Helper function
        isAuthenticated: !!user && !!token, // <-- Check both user and token
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