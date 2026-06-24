import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// A wrapper component that guards private pages from unauthenticated access
// Usage in App.jsx: <ProtectedRoute><CoachDashboard /></ProtectedRoute>
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();

  // If there's no JWT token in state (not signed in), redirect to sign-in
  // This is frontend authorization — the backend also independently validates the token on every API call
  // Both layers are needed: frontend prevents rendering, backend prevents data access
  if (!token) {
    return <Navigate to="/signin" />;
  }

  // Token exists — render the requested page
  return children;
};

export default ProtectedRoute;
