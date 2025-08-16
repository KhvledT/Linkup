import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../Contexts/AuthContext';

export default function ProtactedRoute({children}) {
    const {isloggedIn} = useContext(AuthContext);
  return isloggedIn ? children : <Navigate to="/login" />
}
