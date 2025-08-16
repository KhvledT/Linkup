import React, {useContext } from 'react'
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../Contexts/AuthContext';

export default function ProtectedAuthRoute({ children }) {
    const {isloggedIn} = useContext(AuthContext);
  return isloggedIn ? <Navigate to="/"/> : children
}
