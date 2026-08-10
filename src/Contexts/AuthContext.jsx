// Import React hooks for context creation and state management
import { createContext, useState } from "react";
import { isValidJwt, clearStoredAuth } from "../Services/authHeaders.js";

// Create authentication context for global state management
export const AuthContext = createContext()

// Provider component that wraps the app and provides authentication state
export function AuthContextProvider({ children }) {
  // Authentication state - a valid JWT in localStorage means "logged in".
  // A stale/garbage token (e.g. the literal string "undefined" left behind by an earlier
  // broken build) must NOT count as a session: it would make every API call fail with
  // "jwt malformed". Validate the shape and self-heal when it is not a real JWT.
  const [isloggedIn, setIsloggedIn] = useState(() => {
    const token = localStorage.getItem('token');
    if (token && !isValidJwt(token)) {
      clearStoredAuth();
      return false;
    }
    return Boolean(token);
  });
  
  // User ID state - stores the current user's unique identifier
  const [userID, setUserID] = useState(localStorage.getItem('userID') || '');
  
  // Profile page state - controls whether profile page is open
  const [profilePageIsOpen, setProfilePageIsOpen] = useState(false);

    // Provide authentication context values to all child components
    return (
        <AuthContext.Provider value={{
          isloggedIn, 
          setIsloggedIn, 
          userID, 
          setUserID, 
          profilePageIsOpen, 
          setProfilePageIsOpen
        }}>
            {children}
        </AuthContext.Provider>
    )
}


