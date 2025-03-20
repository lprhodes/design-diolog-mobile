import { Suspense, useEffect } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import DebugImports from "./components/debug-imports";
import Home from "./components/home";
import DebugDashboard from "./components/DebugDashboard";
import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { GoogleAuthProvider } from "./context/AuthContext";
import routes from "tempo-routes";
import ImportDebugComponent from "./components/import-debug";
import JwtDebugComponent from "./components/jwt-debug";
import ModuleExplorer from "./components/module-explorer";
import StarExportAnalyzer from "./components/star-export-analyzer";
import DebuggingDashboard from "./components/debugging-dashboard";
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
            <Route path="/debug" element={<DebugImports />} />
            <Route path="/debug-dashboard" element={<DebugDashboard />} />
            <Route path="/jwt-debug" element={<JwtDebugComponent />} />
            <Route path="/import-debug" element={<ImportDebugComponent />} />
            <Route path="/explore" element={<ModuleExplorer />} />
            <Route path="/star-export" element={<StarExportAnalyzer />} />
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
