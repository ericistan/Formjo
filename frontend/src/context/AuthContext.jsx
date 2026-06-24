import { createContext, useContext, useState } from "react";

// createContext creates a global store that any component can subscribe to
// It solves "prop drilling" — passing user/token through every layer of components
const AuthContext = createContext();

// AuthProvider wraps the entire app (in main.jsx) so every page has access to auth state
export function AuthProvider({ children }) {
  // Initialize from localStorage so the user stays signed in after a page refresh
  // JSON.parse converts the stored string back into a JavaScript object
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Coaches get the dark theme, students get the light theme
  // Tailwind's dark mode works by checking if <html> has the "dark" class
  function applyRoleTheme(role) {
    if (role === "coach") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  // Apply the correct theme on first render if the user is already signed in from localStorage
  if (user) applyRoleTheme(user.role);

  function signin(userData, accessToken) {
    // Update React state — this triggers re-renders across any component using useAuth()
    setUser(userData);
    setToken(accessToken);
    // Persist to localStorage so the session survives a browser refresh or tab close
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);
    applyRoleTheme(userData.role);
  }

  function signout() {
    setUser(null);
    setToken(null);
    // Clear localStorage so the next page load starts unauthenticated
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.documentElement.classList.remove("dark");
  }

  return (
    // value is the object any child component receives when calling useAuth()
    <AuthContext.Provider value={{ user, token, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — shorthand for useContext(AuthContext)
// Any component can call: const { user, token, signin, signout } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}
