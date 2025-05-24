// === src/routes/UserRoutes.jsx ===
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const UserRoutes = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

export default UserRoutes;