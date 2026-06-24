// Entry point — this is the first file Vite runs. It "mounts" the React app onto the HTML page.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import App from "./App.jsx";
import Navbar from "./components/Navbar.jsx";

// Shown when an unhandled JS error crashes a component tree
function ErrorFallback({ error }) {
  return (
    <div>
      <h2>Oops, something went wrong</h2>
      <p>{error.message}</p>
    </div>
  );
}

// document.getElementById("root") finds the <div id="root"> in index.html
// createRoot tells React to own that div and render into it
createRoot(document.getElementById("root")).render(
  // StrictMode runs each component twice in development to catch side-effect bugs — no effect in production
  <StrictMode>
    {/* BrowserRouter gives all child components access to the URL via useNavigate / useParams */}
    <BrowserRouter>
      {/* ErrorBoundary catches render errors in any child and shows ErrorFallback instead of a blank screen */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {/* AuthProvider wraps everything so any component can call useAuth() to get user/token */}
        <AuthProvider>
          {/* Navbar renders on every page — it lives outside <App> so it's always mounted */}
          <Navbar />
          {/* App contains all <Route> definitions — it renders whichever page matches the URL */}
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
