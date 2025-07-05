import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get the ID token
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('firebaseToken', token);
          localStorage.setItem('userEmail', firebaseUser.email);
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
        } else {
          // User is signed out
          localStorage.removeItem('firebaseToken');
          localStorage.removeItem('userEmail');
          setUser(null);
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      apiService.clearAuth();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      setError(error.message);
    }
  };

  const refreshToken = async () => {
    try {
      if (user) {
        const token = await auth.currentUser.getIdToken(true);
        localStorage.setItem('firebaseToken', token);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      setError(error.message);
    }
  };

  const value = {
    user,
    loading,
    error,
    logout,
    refreshToken,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 