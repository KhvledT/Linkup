import { createContext, useState } from "react";




export const AuthContext = createContext()

export function AuthContextProvider({ children }) {
const [isloggedIn, setIsloggedIn] = useState(localStorage.getItem('token') ? true : false);
const [userID, setUserID] = useState(localStorage.getItem('userID') || '');
const [profilePageIsOpen, setProfilePageIsOpen] = useState(false);

    return (
        <AuthContext.Provider value={{isloggedIn, setIsloggedIn , userID, setUserID , profilePageIsOpen, setProfilePageIsOpen}}>
            {children}
        </AuthContext.Provider>
    )
}


