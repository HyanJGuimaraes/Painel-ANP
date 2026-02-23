import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type ProtectedRouteProps = {
    allowedRoles?: string[];
};

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        // Basic loading state while checking token
        return <div className="flex h-screen w-full items-center justify-center">Carregando...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // If user is logged in but doesn't have the right role, redirect to a safe page (or 403)
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
