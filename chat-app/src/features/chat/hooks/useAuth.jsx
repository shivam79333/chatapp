import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthState } from "../../../lib/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Check if Firebase is properly initialized
      const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

      if (!firebaseApiKey || firebaseApiKey === 'your_api_key_here') {
        setError(
          "Firebase API key not configured. Please add your Firebase credentials to .env file."
        );
        setLoading(false);
        return;
      }

      if (!firebaseProjectId || firebaseProjectId === 'your_project_id_here') {
        setError(
          "Firebase Project ID not configured. Please add your Firebase credentials to .env file."
        );
        setLoading(false);
        return;
      }

      const unsubscribe = subscribeToAuthState((authUser) => {
        setUser(authUser);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Auth initialization error:", err);
      setError(err.message || "Failed to initialize authentication");
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    setError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
