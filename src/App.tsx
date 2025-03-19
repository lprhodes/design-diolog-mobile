import { Suspense, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { GoogleAuthProvider } from "./context/AuthContext";
import routes from "tempo-routes";
import { TempoDevtools } from "tempo-devtools";
import axios from "axios";

// Set up axios defaults
axios.defaults.baseURL = import.meta.env.VITE_API_URL || "";

function App() {
  useEffect(() => {
    // Initialize Tempo Devtools
    if (import.meta.env.VITE_TEMPO === "true") {
      TempoDevtools.init();
    }
  }, []);

  return (
    <GoogleAuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
            {import.meta.env.VITE_TEMPO === "true" && (
              <Route path="/tempobook/*" />
            )}
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </GoogleAuthProvider>
  );
}

export default App;
