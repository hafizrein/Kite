"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/app-context';
import { Opportunity, Attachment } from '@/lib/types';
import { opportunitiesService, saveAttachmentsToEntity } from '@/lib/firestore';
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
import { AttachmentForm } from './attachment-form';

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
    attachments: opportunity?.attachments || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when opportunity prop changes
  useEffect(() => {
    if (opportunity) {
      setFormData({
        name: opportunity.name || '',
        accountId: opportunity.accountId || '',
        stage: opportunity.stage || 'Lead',
        amount: opportunity.amount?.toString() || '',
        probability: opportunity.probability?.toString() || '',
        closeDate: opportunity.closeDate || '',
        description: opportunity.description || '',
        ownerId: opportunity.ownerId || state.currentUser?.id || '',
        attachments: opportunity.attachments || [],
      });
    } else {
      // Reset form for new opportunity
      setFormData({
        name: '',
        accountId: '',
        stage: 'Lead',
        amount: '',
        probability: '',
        closeDate: '',
        description: '',
        ownerId: state.currentUser?.id || '',
        attachments: [],
      });
    }
  }, [opportunity, state.currentUser?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const selectedAccount = state.accounts.find(acc => acc.id === formData.accountId);
      
      const opportunityData: Omit<Opportunity, 'id'> = {
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
        // Update existing opportunity in database
        await opportunitiesService.update(opportunity.id, opportunityData);

        // Save attachments to the opportunity
        if (formData.attachments.length > 0) {
          await saveAttachmentsToEntity('opportunities', opportunity.id, formData.attachments);
        }

        // Update local state
        dispatch({
          type: 'UPDATE_OPPORTUNITY',
          payload: { id: opportunity.id, updates: { ...opportunityData, attachments: formData.attachments, id: opportunity.id } }
        });
      } else {
        // Create new opportunity in database
        const opportunityId = await opportunitiesService.create(opportunityData);

        // Save attachments to the new opportunity
        if (formData.attachments.length > 0) {
          await saveAttachmentsToEntity('opportunities', opportunityId, formData.attachments);
        }

        // Add to local state with the new ID
        dispatch({
          type: 'ADD_OPPORTUNITY',
          payload: { ...opportunityData, attachments: formData.attachments, id: opportunityId }
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
        attachments: [],
      });
    } catch (error) {
      console.error('Error saving opportunity:', error);
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
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
                {state.accounts.length === 0 ? (
                  <SelectItem value="no-accounts" disabled>
                    No accounts available
                  </SelectItem>
                ) : (
                  state.accounts.map(account => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))
                )}
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
                  {state.users.length === 0 ? (
                    <SelectItem value="no-users" disabled>
                      No users available
                    </SelectItem>
                  ) : state.users.filter(user => user.role === 'Sales' || user.role === 'Admin').length === 0 ? (
                    <SelectItem value="no-sales-users" disabled>
                      No Sales/Admin users found
                    </SelectItem>
                  ) : (
                    state.users
                      .filter(user => user.role === 'Sales' || user.role === 'Admin')
                      .map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (RM)</Label>
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

          {/* Attachments Section */}
          <AttachmentForm
            attachments={formData.attachments}
            onAttachmentsChange={(attachments) => setFormData(prev => ({ ...prev, attachments }))}
            currentUserId={state.currentUser?.id || ''}
            entityType="opportunities"
            entityId={opportunity?.id || 'new'}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (opportunity ? 'Updating...' : 'Creating...') 
                : (opportunity ? 'Update Opportunity' : 'Create Opportunity')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
