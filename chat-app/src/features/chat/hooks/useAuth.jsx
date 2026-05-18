import React, { createContext, useContext, useEffect, useState } from "react";
import { subscribeToAuthState } from "../../../lib/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
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
