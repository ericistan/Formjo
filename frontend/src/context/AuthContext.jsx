import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

// AuthProvider wraps the entire app (in main.jsx) so every page has access to auth state
export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null,
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Tailwind's dark mode works by checking if <html> has the "dark" class
  function applyRoleTheme(role) {
    if (role === "coach") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  if (user) applyRoleTheme(user.role);

  function signin(userData, accessToken) {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", accessToken);
    applyRoleTheme(userData.role);
  }

  function signout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.documentElement.classList.remove("dark");
  }

  return (
    <AuthContext.Provider value={{ user, token, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
