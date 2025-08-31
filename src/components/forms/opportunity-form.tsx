"use client";

import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Opportunity } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

interface OpportunityFormProps {
  opportunity?: Opportunity;
  isOpen: boolean;
  onClose: () => void;
}

export function OpportunityForm({ opportunity, isOpen, onClose }: OpportunityFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: opportunity?.name || '',
    accountId: opportunity?.accountId || '',
    stage: opportunity?.stage || 'Lead' as Opportunity['stage'],
    amount: opportunity?.amount?.toString() || '',
    probability: opportunity?.probability?.toString() || '',
    closeDate: opportunity?.closeDate || '',
    description: opportunity?.description || '',
    ownerId: opportunity?.ownerId || state.currentUser?.id || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAccount = state.accounts.find(acc => acc.id === formData.accountId);
    
    const opportunityData: Opportunity = {
      id: opportunity?.id || `opp-${Date.now()}`,
      name: formData.name,
      accountId: formData.accountId,
      accountName: selectedAccount?.name || '',
      stage: formData.stage,
      amount: parseFloat(formData.amount) || 0,
      probability: parseInt(formData.probability) || 0,
      closeDate: formData.closeDate,
      description: formData.description,
      ownerId: formData.ownerId,
      createdAt: opportunity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (opportunity) {
      dispatch({
        type: 'UPDATE_OPPORTUNITY',
        payload: { id: opportunity.id, updates: opportunityData }
      });
    } else {
      dispatch({
        type: 'ADD_OPPORTUNITY',
        payload: opportunityData
      });
    }

    onClose();
    setFormData({
      name: '',
      accountId: '',
      stage: 'Lead',
      amount: '',
      probability: '',
      closeDate: '',
      description: '',
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
            {opportunity ? 'Edit Opportunity' : 'Create New Opportunity'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Opportunity Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountId">Account</Label>
            <Select value={formData.accountId} onValueChange={(value) => handleChange('accountId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {state.accounts.map(account => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stage">Stage</Label>
              <Select value={formData.stage} onValueChange={(value: Opportunity['stage']) => handleChange('stage', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Qualification">Qualification</SelectItem>
                  <SelectItem value="Proposal">Proposal</SelectItem>
                  <SelectItem value="Negotiation">Negotiation</SelectItem>
                  <SelectItem value="Closed Won">Closed Won</SelectItem>
                  <SelectItem value="Closed Lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownerId">Owner</Label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="probability">Probability (%)</Label>
              <Input
                id="probability"
                type="number"
                min="0"
                max="100"
                value={formData.probability}
                onChange={(e) => handleChange('probability', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="closeDate">Expected Close Date</Label>
            <Input
              id="closeDate"
              type="date"
              value={formData.closeDate}
              onChange={(e) => handleChange('closeDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {opportunity ? 'Update Opportunity' : 'Create Opportunity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
