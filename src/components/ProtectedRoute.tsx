// ═══════════════════════════════════════════════════════════════
// 🔐 PROTECTED ROUTE WITH ROLE CHECK
// ═══════════════════════════════════════════════════════════════

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canAccessAdminPanel } from '../types/roles';
import type { UserRole } from '../types/roles';
import { Spin } from 'antd';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAdmin = false,
    allowedRoles,
}) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Spin size="large" />
            </div>
        );
    }

    // Not logged in - redirect to login
    if (!user) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Check if admin access required
    if (requireAdmin) {
        const hasAdminAccess = canAccessAdminPanel(user.role as UserRole);
        if (!hasAdminAccess) {
            return <Navigate to="/" replace />;
        }
    }

    // Check specific roles
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role as UserRole;
        if (!allowedRoles.includes(userRole) && userRole !== 'super_admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    return <>{children}</>;
};
