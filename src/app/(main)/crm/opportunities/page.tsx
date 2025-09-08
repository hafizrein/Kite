"use client";

import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Opportunity } from '@/lib/types';
import { convertOpportunityToProject, opportunitiesService } from '@/lib/firestore';
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
import { MoreHorizontal, Edit, Eye, Trash2, Plus, TrendingUp, FolderKanban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { OpportunityForm } from '@/components/forms/opportunity-form';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";

export default function OpportunitiesPage() {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [deleteOpportunityId, setDeleteOpportunityId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [convertingOpportunity, setConvertingOpportunity] = useState<string | null>(null);

  // Get unique stages for filter
  const stages = ['All', 'Lead', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

  // Filter opportunities based on search and stage
  const filteredOpportunities = state.opportunities.filter(opportunity => {
    const matchesSearch = opportunity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opportunity.accountName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || opportunity.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity);
    setIsFormOpen(true);
  };

  const handleDelete = async (opportunityId: string) => {
    try {
      // Delete from database
      await opportunitiesService.delete(opportunityId);
      
      // Update local state
      dispatch({ type: 'DELETE_OPPORTUNITY', payload: opportunityId });
      setDeleteOpportunityId(null);
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      // You might want to show an error toast here
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingOpportunity(null);
  };

  const handleConvertToProject = async (opportunity: Opportunity) => {
    try {
      setConvertingOpportunity(opportunity.id);
      
      const account = state.accounts.find(acc => acc.id === opportunity.accountId);
      
      const projectData = {
        name: `${opportunity.name} - Project`,
        description: `Converted from opportunity: ${opportunity.description || opportunity.name}`,
        status: 'Not Started' as const,
        cpi: 1.0,
        spi: 1.0,
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        budget: opportunity.amount,
        spent: 0,
        managerId: state.currentUser?.id || '',
        teamMembers: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const projectId = await convertOpportunityToProject(opportunity.id, projectData);
      
      // Update local state
      dispatch({
        type: 'ADD_PROJECT',
        payload: { id: projectId, ...projectData }
      });
      
      dispatch({
        type: 'UPDATE_OPPORTUNITY',
        payload: {
          id: opportunity.id,
          updates: { 
            stage: 'Closed Won',
            updatedAt: new Date().toISOString()
          }
        }
      });

      toast({
        title: "Success",
        description: `Opportunity converted to project successfully!`,
      });
    } catch (error) {
      console.error('Error converting opportunity:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to convert opportunity to project",
      });
    } finally {
      setConvertingOpportunity(null);
    }
  };

  const getOwnerName = (ownerId: string) => {
    const owner = state.users.find(user => user.id === ownerId);
    return owner?.name || 'Unassigned';
  };

  const getStageVariant = (stage: string) => {
    switch (stage) {
      case 'Closed Won':
        return 'default';
      case 'Closed Lost':
        return 'destructive';
      case 'Negotiation':
        return 'secondary';
      case 'Proposal':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getTotalValue = () => {
    return filteredOpportunities.reduce((sum, opp) => sum + opp.amount, 0);
  };

  const getWeightedValue = () => {
    return filteredOpportunities.reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Opportunities</p>
                <p className="text-2xl font-bold">{filteredOpportunities.length}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${getTotalValue().toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weighted Value</p>
                <p className="text-2xl font-bold">${getWeightedValue().toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Opportunities</CardTitle>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Opportunity
          </Button>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              {stages.map(stage => (
                <option key={stage} value={stage}>
                  {stage === 'All' ? 'All Stages' : stage}
                </option>
              ))}
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Opportunity Name</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Probability</TableHead>
                <TableHead>Expected Value</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Close Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No opportunities found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOpportunities.map((opportunity) => (
                  <TableRow key={opportunity.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{opportunity.name}</div>
                        {opportunity.description && (
                          <div className="text-sm text-muted-foreground">
                            {opportunity.description.length > 40 
                              ? `${opportunity.description.substring(0, 40)}...` 
                              : opportunity.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{opportunity.accountName}</TableCell>
                    <TableCell>
                      <Badge variant={getStageVariant(opportunity.stage)}>
                        {opportunity.stage}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${opportunity.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{opportunity.probability}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${opportunity.probability}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      ${(opportunity.amount * opportunity.probability / 100).toLocaleString()}
                    </TableCell>
                    <TableCell>{getOwnerName(opportunity.ownerId)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(opportunity.closeDate)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleEdit(opportunity)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {opportunity.stage === 'Negotiation' || opportunity.stage === 'Proposal' ? (
                            <DropdownMenuItem 
                              onClick={() => handleConvertToProject(opportunity)}
                              disabled={convertingOpportunity === opportunity.id}
                            >
                              <FolderKanban className="mr-2 h-4 w-4" />
                              {convertingOpportunity === opportunity.id ? 'Converting...' : 'Convert to Project'}
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteOpportunityId(opportunity.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Opportunity Form Dialog */}
      <OpportunityForm
        opportunity={editingOpportunity || undefined}
        isOpen={isFormOpen}
        onClose={handleFormClose}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOpportunityId} onOpenChange={() => setDeleteOpportunityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the opportunity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteOpportunityId && handleDelete(deleteOpportunityId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
