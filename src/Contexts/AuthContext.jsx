// Import React hooks for context creation and state management
import { createContext, useState } from "react";

// Create authentication context for global state management
export const AuthContext = createContext()

// Provider component that wraps the app and provides authentication state
export function AuthContextProvider({ children }) {
  // Authentication state - checks localStorage for existing token
  const [isloggedIn, setIsloggedIn] = useState(localStorage.getItem('token') ? true : false);
  
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


