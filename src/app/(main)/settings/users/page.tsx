"use client";

import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { User } from '@/lib/types';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shield, Users, Crown, Briefcase, ShoppingCart, User as UserIcon } from 'lucide-react';

const roleIcons = {
  Owner: Crown,
  Admin: Shield,
  PM: Briefcase,
  Sales: ShoppingCart,
  Member: UserIcon,
};

const roleColors = {
  Owner: 'bg-purple-100 text-purple-800 border-purple-200',
  Admin: 'bg-red-100 text-red-800 border-red-200',
  PM: 'bg-blue-100 text-blue-800 border-blue-200',
  Sales: 'bg-green-100 text-green-800 border-green-200',
  Member: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function UsersManagementPage() {
  const { state, dispatch } = useApp();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [confirmRoleChange, setConfirmRoleChange] = useState<{
    userId: string;
    newRole: User['role'];
    userName: string;
  } | null>(null);

  // Only Owner and Admin can access this page
  if (!currentUser || !['Owner', 'Admin'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to manage users.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    if (userId === currentUser.id && newRole !== 'Owner' && newRole !== 'Admin') {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You cannot remove your own admin privileges",
      });
      return;
    }

    const user = state.users.find(u => u.id === userId);
    if (!user) return;

    setConfirmRoleChange({
      userId,
      newRole,
      userName: user.name,
    });
  };

  const confirmRoleUpdate = async () => {
    if (!confirmRoleChange) return;

    const { userId, newRole } = confirmRoleChange;
    setUpdatingUserId(userId);

    try {
      // Update in Firestore
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });

      // Update local state
      dispatch({
        type: 'SET_USERS',
        payload: state.users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ),
      });

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user role",
      });
    } finally {
      setUpdatingUserId(null);
      setConfirmRoleChange(null);
    }
  };

  const getRoleDescription = (role: User['role']) => {
    switch (role) {
      case 'Owner':
        return 'Full system access and user management';
      case 'Admin':
        return 'Full access to all features and settings';
      case 'PM':
        return 'Project management and team coordination';
      case 'Sales':
        return 'CRM access and opportunity management';
      case 'Member':
        return 'Basic project participation';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {state.users.length} users
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {state.users.map((user) => {
                const RoleIcon = roleIcons[user.role];
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                        {user.department && (
                          <div className="text-xs text-muted-foreground">
                            {user.department}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColors[user.role]}>
                        <RoleIcon className="h-3 w-3 mr-1" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {getRoleDescription(user.role)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.id !== currentUser.id ? (
                        <Select
                          value={user.role}
                          onValueChange={(newRole: User['role']) =>
                            handleRoleChange(user.id, newRole)
                          }
                          disabled={updatingUserId === user.id}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currentUser.role === 'Owner' && (
                              <SelectItem value="Owner">Owner</SelectItem>
                            )}
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                            <SelectItem value="Sales">Sales</SelectItem>
                            <SelectItem value="Member">Member</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          (You)
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Role Change Confirmation Dialog */}
      <AlertDialog 
        open={!!confirmRoleChange} 
        onOpenChange={() => setConfirmRoleChange(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change {confirmRoleChange?.userName}'s role to{' '}
              <strong>{confirmRoleChange?.newRole}</strong>?
              <br />
              <br />
              This will {confirmRoleChange?.newRole === 'Member' ? 'remove' : 'grant'} their{' '}
              administrative privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleUpdate}>
              Update Role
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
