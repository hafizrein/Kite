"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  ChevronsUpDown,
  Plus,
  Building,
  Users,
  Settings,
  Crown,
  Shield
} from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  avatar?: string;
  plan: 'free' | 'pro' | 'enterprise';
  memberCount: number;
  role: 'owner' | 'admin' | 'member' | 'guest';
  isActive: boolean;
}

// Mock data - in real app, this would come from Firestore
const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Kite Digital Solutions',
    slug: 'kite-digital',
    avatar: '',
    plan: 'pro',
    memberCount: 15,
    role: 'owner',
    isActive: true,
  },
  {
    id: '2',
    name: 'Freelance Projects',
    slug: 'freelance',
    avatar: '',
    plan: 'free',
    memberCount: 1,
    role: 'owner',
    isActive: false,
  },
  {
    id: '3',
    name: 'Client Corp',
    slug: 'client-corp',
    avatar: '',
    plan: 'enterprise',
    memberCount: 250,
    role: 'member',
    isActive: false,
  },
];

export function OrganizationSwitcher() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [organizations] = useState<Organization[]>(mockOrganizations);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentOrg = organizations.find(org => org.isActive) || organizations[0];

  const handleSwitchOrganization = async (orgId: string) => {
    setIsLoading(true);
    try {
      // In real app, make API call to switch organization
      // await organizationService.switchOrganization(orgId);
      
      toast({
        title: "Organization switched",
        description: `Switched to ${organizations.find(o => o.id === orgId)?.name}`,
      });
      
      // Reload the page or update context to reflect new organization
      window.location.reload();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to switch organization",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!newOrgName.trim()) return;
    
    setIsLoading(true);
    try {
      // In real app, make API call to create organization
      // await organizationService.createOrganization({ name: newOrgName });
      
      toast({
        title: "Organization created",
        description: `${newOrgName} has been created successfully`,
      });
      
      setIsCreateDialogOpen(false);
      setNewOrgName('');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create organization",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return Crown;
      case 'admin': return Shield;
      default: return Users;
    }
  };

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default';
      case 'pro': return 'secondary';
      default: return 'outline';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={currentOrg?.avatar} alt={currentOrg?.name} />
              <AvatarFallback className="text-xs">
                {getInitials(currentOrg?.name || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium truncate max-w-[120px]">
                {currentOrg?.name}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {currentOrg?.role}
              </span>
            </div>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80" align="start">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Organizations</span>
          <Badge variant="outline" className="text-xs">
            {organizations.length}
          </Badge>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {organizations.map((org) => {
          const RoleIcon = getRoleIcon(org.role);
          const isCurrentOrg = org.id === currentOrg?.id;
          
          return (
            <DropdownMenuItem
              key={org.id}
              onClick={() => !isCurrentOrg && handleSwitchOrganization(org.id)}
              className="flex items-center space-x-3 p-3 cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={org.avatar} alt={org.name} />
                <AvatarFallback className="text-xs">
                  {getInitials(org.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-sm truncate">
                    {org.name}
                  </span>
                  {isCurrentOrg && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <RoleIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground capitalize">
                      {org.role}
                    </span>
                  </div>
                  
                  <Badge 
                    variant={getPlanBadgeVariant(org.plan)}
                    className="text-xs px-1 py-0"
                  >
                    {org.plan}
                  </Badge>
                  
                  <div className="flex items-center space-x-1">
                    <Users className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {org.memberCount}
                    </span>
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="flex items-center space-x-2 p-3 cursor-pointer"
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-md border-2 border-dashed border-muted-foreground/25">
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm">Create organization</span>
            </DropdownMenuItem>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create new organization</DialogTitle>
              <DialogDescription>
                Create a new organization to manage projects and team members separately.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="org-name">Organization name</Label>
                <Input
                  id="org-name"
                  placeholder="Enter organization name"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateOrganization}
                disabled={isLoading || !newOrgName.trim()}
              >
                {isLoading ? "Creating..." : "Create organization"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem className="flex items-center space-x-2 p-3 cursor-pointer">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">Organization settings</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Organization context provider for multi-org support
export interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  switchOrganization: (orgId: string) => Promise<void>;
  createOrganization: (data: { name: string }) => Promise<void>;
  updateOrganization: (orgId: string, data: Partial<Organization>) => Promise<void>;
  deleteOrganization: (orgId: string) => Promise<void>;
  inviteUser: (orgId: string, email: string, role: string) => Promise<void>;
  removeUser: (orgId: string, userId: string) => Promise<void>;
  updateUserRole: (orgId: string, userId: string, role: string) => Promise<void>;
}

const OrganizationContext = React.createContext<OrganizationContextType | undefined>(undefined);

export function useOrganization() {
  const context = React.useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(mockOrganizations[0]);
  const [organizations, setOrganizations] = useState<Organization[]>(mockOrganizations);

  const switchOrganization = async (orgId: string) => {
    // In real app, make API call and update user's current organization
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      setOrganizations(prev => 
        prev.map(o => ({ ...o, isActive: o.id === orgId }))
      );
    }
  };

  const createOrganization = async (data: { name: string }) => {
    // In real app, make API call to create organization
    const newOrg: Organization = {
      id: Date.now().toString(),
      name: data.name,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      plan: 'free',
      memberCount: 1,
      role: 'owner',
      isActive: false,
    };
    setOrganizations(prev => [...prev, newOrg]);
  };

  const updateOrganization = async (orgId: string, data: Partial<Organization>) => {
    // In real app, make API call
    setOrganizations(prev => 
      prev.map(org => org.id === orgId ? { ...org, ...data } : org)
    );
  };

  const deleteOrganization = async (orgId: string) => {
    // In real app, make API call
    setOrganizations(prev => prev.filter(org => org.id !== orgId));
  };

  const inviteUser = async (orgId: string, email: string, role: string) => {
    // In real app, make API call to send invitation
    console.log('Inviting user:', { orgId, email, role });
  };

  const removeUser = async (orgId: string, userId: string) => {
    // In real app, make API call
    console.log('Removing user:', { orgId, userId });
  };

  const updateUserRole = async (orgId: string, userId: string, role: string) => {
    // In real app, make API call
    console.log('Updating user role:', { orgId, userId, role });
  };

  const value: OrganizationContextType = {
    currentOrganization,
    organizations,
    switchOrganization,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    inviteUser,
    removeUser,
    updateUserRole,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}
