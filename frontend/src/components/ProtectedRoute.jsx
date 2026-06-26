import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Usage in App.jsx: <ProtectedRoute><CoachDashboard /></ProtectedRoute>
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/signin" />;
  }

  return children;
};

export default ProtectedRoute;

//need a check for coach and student.
