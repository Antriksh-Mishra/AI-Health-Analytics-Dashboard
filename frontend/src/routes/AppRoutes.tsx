import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/common/ProtectedRoute";
import LandingPage from "../pages/Landing/LandingPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import ReportsPage from "../pages/Reports/ReportsPage";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
    </AuthProvider>
  );
}