'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Users, Shield, UserCheck, UserX, Settings, Search, Filter } from 'lucide-react';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { ErrorDisplay } from '@/components/atoms/ErrorDisplay';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

interface UserManagementProps {
  canManageUsers?: boolean;
}

export function UserManagement({ canManageUsers = false }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      username: 'admin',
      email: 'admin@bettergolf.com',
      roles: ['Admin'],
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      username: 'organizer1',
      email: 'organizer@bettergolf.com',
      roles: ['TournamentOrganizer'],
      isActive: true,
      lastLogin: '2024-01-14T15:45:00Z',
      createdAt: '2024-01-02T00:00:00Z',
    },
    {
      id: '3',
      username: 'player1',
      email: 'player@bettergolf.com',
      roles: ['Player'],
      isActive: true,
      lastLogin: '2024-01-13T09:15:00Z',
      createdAt: '2024-01-03T00:00:00Z',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();

  const availableRoles = ['Admin', 'TournamentOrganizer', 'Player'];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'TournamentOrganizer': return 'bg-blue-100 text-blue-800';
      case 'Player': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    if (!canManageUsers) return;

    setIsLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, isActive: !user.isActive } : user
      ));

      const user = users.find(u => u.id === userId);
      toast({
        title: "User Status Updated",
        description: `${user?.username} has been ${user?.isActive ? 'deactivated' : 'activated'}.`,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedUser || !newRole || !canManageUsers) return;

    setIsLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, roles: [...new Set([...user.roles, newRole])] }
          : user
      ));

      toast({
        title: "Role Assigned",
        description: `${newRole} role has been assigned to ${selectedUser.username}.`,
      });

      setShowRoleDialog(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: "Failed to assign role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (userId: string, roleToRemove: string) => {
    if (!canManageUsers) return;

    setIsLoading(true);
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { ...user, roles: user.roles.filter(role => role !== roleToRemove) }
          : user
      ));

      const user = users.find(u => u.id === userId);
      toast({
        title: "Role Removed",
        description: `${roleToRemove} role has been removed from ${user?.username}.`,
      });
    } catch (error) {
      toast({
        title: "Removal Failed",
        description: "Failed to remove role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getUserStats = () => {
    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const admins = users.filter(u => u.roles.includes('Admin')).length;
    const organizers = users.filter(u => u.roles.includes('TournamentOrganizer')).length;
    
    return { total, active, admins, organizers };
  };

  const stats = getUserStats();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-muted-foreground">Total Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-muted-foreground">Active Users</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.active}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-muted-foreground">Administrators</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.admins}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-muted-foreground">Organizers</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.organizers}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search Users</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="role-filter">Role</Label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {availableRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Users Table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  {canManageUsers && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.username}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} className={getRoleBadgeColor(role)}>
                            {role}
                            {canManageUsers && user.roles.length > 1 && (
                              <button
                                onClick={() => handleRemoveRole(user.id, role)}
                                className="ml-1 hover:bg-black/10 rounded-full p-0.5"
                                disabled={isLoading}
                              >
                                ×
                              </button>
                            )}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        {canManageUsers && (
                          <Switch
                            checked={user.isActive}
                            onCheckedChange={() => handleToggleUserStatus(user.id)}
                            disabled={isLoading}
                          />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                    </TableCell>
                    <TableCell>
                      {formatDate(user.createdAt)}
                    </TableCell>
                    {canManageUsers && (
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleDialog(true);
                          }}
                          disabled={isLoading}
                        >
                          Manage Roles
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching the current filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Assignment Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-md">
                <div className="font-medium">{selectedUser.username}</div>
                <div className="text-sm text-muted-foreground">{selectedUser.email}</div>
              </div>

              <div>
                <Label>Current Roles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedUser.roles.map((role) => (
                    <Badge key={role} className={getRoleBadgeColor(role)}>
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <Label htmlFor="new-role">Assign New Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles
                      .filter(role => !selectedUser.roles.includes(role))
                      .map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignRole}
                  disabled={!newRole || isLoading}
                >
                  {isLoading ? 'Assigning...' : 'Assign Role'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {isLoading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center gap-2">
            <LoadingSpinner size="sm" />
            <span>Updating user...</span>
          </div>
        </div>
      )}
    </div>
  );
}
