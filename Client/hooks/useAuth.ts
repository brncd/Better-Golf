import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, isAuthenticated, login, logout, isLoading } = context;

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) ?? false;
  };

  const isAdmin = (): boolean => {
    return hasRole('Admin');
  };

  const isTournamentOrganizer = (): boolean => {
    return hasRole('TournamentOrganizer') || isAdmin();
  };

  const isPlayer = (): boolean => {
    return hasRole('Player');
  };

  const canManageTournaments = (): boolean => {
    return isTournamentOrganizer();
  };

  const canManageUsers = (): boolean => {
    return isAdmin();
  };

  const canViewAdminPanel = (): boolean => {
    return isAdmin();
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    loading: isLoading,
    hasRole,
    isAdmin,
    isTournamentOrganizer,
    isPlayer,
    canManageTournaments,
    canManageUsers,
    canViewAdminPanel,
  };
};
