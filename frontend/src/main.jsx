// Entry point — this is the first file Vite runs. It "mounts" the React app onto the HTML page.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import App from "./App.jsx";
import Navbar from "./components/Navbar.jsx";

function ErrorFallback({ error }) {
  return (
    <div>
      <h2>Oops, something went wrong</h2>
      <p>{error.message}</p>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthProvider>
          <Navbar />
          <App />
        </AuthProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>,
);
