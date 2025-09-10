"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/contexts/app-context';
import { Project } from '@/lib/types';
import { projectsService } from '@/lib/firestore';
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
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ProjectFormProps {
  project?: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectForm({ project, isOpen, onClose }: ProjectFormProps) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'Not Started' as Project['status'],
    startDate: project?.startDate || '',
    endDate: project?.endDate || '',
    budget: project?.budget?.toString() || '',
    spent: project?.spent?.toString() || '0',
    managerId: project?.managerId || state.currentUser?.id || '',
    progress: project?.progress?.toString() || '0',
    teamMembers: project?.teamMembers || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form data when project prop changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        status: project.status || 'Not Started',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        budget: project.budget?.toString() || '',
        spent: project.spent?.toString() || '0',
        managerId: project.managerId || state.currentUser?.id || '',
        progress: project.progress?.toString() || '0',
        teamMembers: project.teamMembers || [],
      });
    } else {
      // Reset form for new project
      setFormData({
        name: '',
        description: '',
        status: 'Not Started',
        startDate: '',
        endDate: '',
        budget: '',
        spent: '0',
        managerId: state.currentUser?.id || '',
        progress: '0',
        teamMembers: [],
      });
    }
  }, [project, state.currentUser?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Calculate progress based on status if not explicitly set
      let calculatedProgress = parseFloat(formData.progress) || 0;
      
      // Auto-calculate progress based on status
      if (formData.status === 'Completed') {
        calculatedProgress = 100;
      } else if (formData.status === 'Not Started') {
        calculatedProgress = Math.max(0, calculatedProgress); // Keep user input but ensure >= 0
      } else if (formData.status === 'In Progress') {
        calculatedProgress = Math.max(1, Math.min(99, calculatedProgress)); // Between 1-99%
      } else if (formData.status === 'On Hold') {
        calculatedProgress = Math.max(0, Math.min(99, calculatedProgress)); // Keep current progress
      }

      const projectData: Omit<Project, 'id'> = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        cpi: project?.cpi || 1.0,
        spi: project?.spi || 1.0,
        progress: calculatedProgress,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: parseFloat(formData.budget) || 0,
        spent: parseFloat(formData.spent) || 0,
        managerId: formData.managerId,
        teamMembers: formData.teamMembers,
        createdAt: project?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (project) {
        // Update existing project in database
        await projectsService.update(project.id, projectData);
        
        // Update local state
        dispatch({
          type: 'UPDATE_PROJECT',
          payload: { id: project.id, updates: { ...projectData, id: project.id } }
        });
      } else {
        // Create new project in database
        const projectId = await projectsService.create(projectData);
        
        // Add to local state with the new ID
        dispatch({
          type: 'ADD_PROJECT',
          payload: { ...projectData, id: projectId }
        });
      }

      onClose();
      setFormData({
        name: '',
        description: '',
        status: 'Not Started',
        startDate: '',
        endDate: '',
        budget: '',
        spent: '0',
        managerId: state.currentUser?.id || '',
        progress: '0',
        teamMembers: [],
      });
    } catch (error) {
      console.error('Error saving project:', error);
      // You might want to show an error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string | string[]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-update progress when status changes
      if (field === 'status' && typeof value === 'string') {
        switch (value) {
          case 'Completed':
            newData.progress = '100';
            break;
          case 'Not Started':
            newData.progress = '0';
            break;
          case 'In Progress':
            // Keep current progress if it's reasonable, otherwise set to 50%
            const currentProgress = parseFloat(prev.progress as string) || 0;
            if (currentProgress <= 0) {
              newData.progress = '50';
            }
            break;
          case 'On Hold':
            // Keep current progress
            break;
        }
      }
      
      return newData;
    });
  };

  const handleAddTeamMember = (userId: string) => {
    if (!formData.teamMembers.includes(userId)) {
      handleChange('teamMembers', [...formData.teamMembers, userId]);
    }
  };

  const handleRemoveTeamMember = (userId: string) => {
    handleChange('teamMembers', formData.teamMembers.filter(id => id !== userId));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: Project['status']) => handleChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Not Started">Not Started</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="managerId">Project Manager</Label>
              <Select value={formData.managerId} onValueChange={(value) => handleChange('managerId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  {state.users
                    .filter(user => user.role === 'PM' || user.role === 'Admin')
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
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget">Budget ($)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => handleChange('budget', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spent">Spent ($)</Label>
              <Input
                id="spent"
                type="number"
                step="0.01"
                min="0"
                value={formData.spent}
                onChange={(e) => handleChange('spent', e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress (%)</Label>
              <Input
                id="progress"
                type="number"
                min="0"
                max="100"
                value={formData.progress}
                onChange={(e) => handleChange('progress', e.target.value)}
                placeholder="0-100"
              />
              <p className="text-xs text-muted-foreground">
                Auto-calculated based on status, or set manually
              </p>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="space-y-3">
            <Label>Team Members</Label>
            <div className="space-y-2">
              <Select onValueChange={handleAddTeamMember}>
                <SelectTrigger>
                  <SelectValue placeholder="Add team member..." />
                </SelectTrigger>
                <SelectContent>
                  {state.users
                    .filter(user => !formData.teamMembers.includes(user.id))
                    .map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              
              {formData.teamMembers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.teamMembers.map(memberId => {
                    const member = state.users.find(u => u.id === memberId);
                    return member ? (
                      <Badge key={memberId} variant="secondary" className="flex items-center gap-1">
                        {member.name}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleRemoveTeamMember(memberId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? (project ? 'Updating...' : 'Creating...') 
                : (project ? 'Update Project' : 'Create Project')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
