import { Navigate, useLocation } from 'react-router-dom';
import { useGame } from '../context/GameContext';

/**
 * ProtectedRoute — renders children only when user is logged in.
 * If not logged in, redirects to /login and preserves the original
 * path in location state so we can redirect back after login.
 */
const ProtectedRoute = ({ children }) => {
  const { user } = useGame();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
