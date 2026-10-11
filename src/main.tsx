import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import FerrataDetailPage from "@/pages/FerrataDetailPage";
import AuthPage from "@/pages/AuthPage";
import ProgressPage from "@/pages/ProgressPage";
import NotFoundPage from "@/pages/NotFoundPage";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import "@/index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<App />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route
              path="/ferratas/:ferrataId"
              element={<FerrataDetailPage />}
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
