import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import FoodsPage from "./pages/FoodsPage";
import MealLogPage from "./pages/MealLogPage";
import MealPlanPage from "./pages/MealPlanPage";
import ChatPage from "./pages/ChatPage";
import AllergensPage from "./pages/AllergensPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    return (
        <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/foods"
                element={
                    <ProtectedRoute>
                        <FoodsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/log"
                element={
                    <ProtectedRoute>
                        <MealLogPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/plan"
                element={
                    <ProtectedRoute>
                        <MealPlanPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/chat"
                element={
                    <ProtectedRoute>
                        <ChatPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/allergens"
                element={
                    <ProtectedRoute>
                        <AllergensPage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}
