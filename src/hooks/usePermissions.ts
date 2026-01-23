// ═══════════════════════════════════════════════════════════════
// 🔐 PERMISSIONS HOOK
// ═══════════════════════════════════════════════════════════════

import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    Permission,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessAdminPanel,
    getRolePermissions,
    ROLE_CONFIGS,
} from '../types/roles';
import type { UserRole } from '../types/roles';

export const usePermissions = () => {
    const { user } = useAuth();

    const userRole = useMemo(() => {
        return (user?.role as UserRole) || 'viewer';
    }, [user?.role]);

    const permissions = useMemo(() => {
        return getRolePermissions(userRole);
    }, [userRole]);

    const roleConfig = useMemo(() => {
        return ROLE_CONFIGS[userRole];
    }, [userRole]);

    // Check single permission
    const can = (permission: Permission): boolean => {
        if (!user) return false;
        return hasPermission(userRole, permission);
    };

    // Check if user has any of the permissions
    const canAny = (permissionsList: Permission[]): boolean => {
        if (!user) return false;
        return hasAnyPermission(userRole, permissionsList);
    };

    // Check if user has all permissions
    const canAll = (permissionsList: Permission[]): boolean => {
        if (!user) return false;
        return hasAllPermissions(userRole, permissionsList);
    };

    // Quick role checks
    const isViewer = userRole === 'viewer';
    const isPremium = userRole === 'premium' || user?.isPremium === true;
    const isProfileUser = userRole === 'profile_user';
    const isCreator = userRole === 'creator';
    const isContentManager = userRole === 'content_manager';
    const isModerator = userRole === 'moderator';
    const isFinance = userRole === 'finance';
    const isAnalyst = userRole === 'analyst';
    const isTechAdmin = userRole === 'tech_admin';
    const isSuperAdmin = userRole === 'super_admin';

    // Admin checks
    const isAdmin = canAccessAdminPanel(userRole);
    const canManageContent = can(Permission.EDIT_ANY_CONTENT);
    const canManageUsers = can(Permission.MANAGE_ADMINS);

    return {
        // User info
        user,
        userRole,
        roleConfig,
        permissions,

        // Permission checks
        can,
        canAny,
        canAll,

        // Role checks
        isViewer,
        isPremium,
        isProfileUser,
        isCreator,
        isContentManager,
        isModerator,
        isFinance,
        isAnalyst,
        isTechAdmin,
        isSuperAdmin,
        isAdmin,
        canManageContent,
        canManageUsers,
    };
};
