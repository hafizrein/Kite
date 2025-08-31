"use client";

import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Account } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AccountFormProps {
  account?: Account;
  isOpen: boolean;
  onClose: () => void;
}

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Consulting',
  'Manufacturing',
  'Retail',
  'Education',
  'Non-profit',
  'Government',
  'Startup',
  'Other'
];

export function AccountForm({ account, isOpen, onClose }: AccountFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: account?.name || '',
    industry: account?.industry || '',
    website: account?.website || '',
    phone: account?.phone || '',
    email: account?.email || '',
    address: account?.address || '',
    ownerId: account?.ownerId || state.currentUser?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const accountData: Account = {
      id: account?.id || `acc-${Date.now()}`,
      name: formData.name,
      industry: formData.industry,
      website: formData.website,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      ownerId: formData.ownerId,
      createdAt: account?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (account) {
      dispatch({
        type: 'UPDATE_ACCOUNT',
        payload: { id: account.id, updates: accountData }
      });
    } else {
      dispatch({
        type: 'ADD_ACCOUNT',
        payload: accountData
      });
    }

    onClose();
    setFormData({
      name: '',
      industry: '',
      website: '',
      phone: '',
      email: '',
      address: '',
      ownerId: state.currentUser?.id || '',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Edit Account' : 'Create New Account'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Account Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={formData.industry} onValueChange={(value) => handleChange('industry', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerId">Account Owner</Label>
              <Select value={formData.ownerId} onValueChange={(value) => handleChange('ownerId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select owner" />
                </SelectTrigger>
                <SelectContent>
                  {state.users
                    .filter(user => user.role === 'Sales' || user.role === 'Admin')
                    .map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1-555-0123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="contact@example.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {account ? 'Update Account' : 'Create Account'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
