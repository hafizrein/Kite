"use client";

import React, { useState } from 'react';
import { useApp } from '@/contexts/app-context';
import { Project } from '@/lib/types';
import { projectsService } from '@/lib/firestore';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Edit, Eye, Archive, Plus, Workflow } from "lucide-react";
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
import { ProjectForm } from '@/components/forms/project-form';
import { Input } from '@/components/ui/input';
import { WBSTree } from '@/components/wbs-tree';
import { WBSTask } from '@/lib/types';
import { getProjectWBSTasks, saveProjectWBSTasks } from '@/lib/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";

export default function ProjectsPage() {
  const { state, dispatch } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [wbsTasks, setWBSTasks] = useState<Record<string, WBSTask[]>>({});

  // Filter projects based on search and status
  const filteredProjects = state.projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    try {
      // Delete from database
      await projectsService.delete(projectId);
      
      // Update local state
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
      setDeleteProjectId(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      // You might want to show an error toast here
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'default';
      case 'In Progress':
        return 'secondary';
      case 'On Hold':
        return 'outline';
      case 'Not Started':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getManagerName = (managerId: string) => {
    const manager = state.users.find(user => user.id === managerId);
    return manager?.name || 'Unassigned';
  };

  const handleWBSTasksChange = async (projectId: string, tasks: WBSTask[]) => {
    setWBSTasks(prev => ({
      ...prev,
      [projectId]: tasks
    }));
    try {
      await saveProjectWBSTasks(projectId, tasks);
      // Recalculate project progress from root tasks
      const rootTasks = tasks; // top-level tasks are roots
      const progress = rootTasks.length === 0
        ? 0
        : Math.round(rootTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / rootTasks.length);
      // Persist to Firestore and update local state
      await projectsService.update(projectId, { progress } as Partial<Project>);
      dispatch({ type: 'UPDATE_PROJECT', payload: { id: projectId, updates: { progress } } });
    } catch (err) {
      console.error('Failed to save WBS tasks:', err);
    }
  };

  // Load WBS when a project is selected
  React.useEffect(() => {
    if (!selectedProjectId) return;
    (async () => {
      try {
        const loaded = await getProjectWBSTasks(selectedProjectId);
        setWBSTasks(prev => ({ ...prev, [selectedProjectId]: loaded }));
      } catch (err) {
        console.error('Failed to load WBS tasks:', err);
        setWBSTasks(prev => ({ ...prev, [selectedProjectId]: prev[selectedProjectId] || [] }));
      }
    })();
  }, [selectedProjectId]);

  const selectedProject = selectedProjectId ? state.projects.find(p => p.id === selectedProjectId) : null;

  if (selectedProjectId && selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedProjectId(null)}
          >
            ← Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
            <p className="text-muted-foreground">Project Work Breakdown Structure</p>
          </div>
        </div>
        
        <WBSTree
          projectId={selectedProjectId}
          tasks={wbsTasks[selectedProjectId] || []}
          onTasksChange={(tasks) => handleWBSTasksChange(selectedProjectId, tasks)}
          users={state.users}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md"
            >
              <option value="All">All Status</option>
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Team Members</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>CPI</TableHead>
                <TableHead>SPI</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground">
                    No projects found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground">
                            {project.description.length > 50 
                              ? `${project.description.substring(0, 50)}...` 
                              : project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getManagerName(project.managerId)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.teamMembers.length > 0 ? (
                          project.teamMembers.slice(0, 3).map(memberId => {
                            const member = state.users.find(u => u.id === memberId);
                            return member ? (
                              <Badge key={memberId} variant="outline" className="text-xs">
                                {member.name}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-muted-foreground text-sm">No members</span>
                        )}
                        {project.teamMembers.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.teamMembers.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{formatCurrency(project.budget)}</div>
                        <div className="text-sm text-muted-foreground">
                          Spent: {formatCurrency(project.spent)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className={project.cpi < 1 ? 'text-destructive font-medium' : 'text-green-600 font-medium'}
                    >
                      {project.cpi.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={project.spi < 1 ? 'text-destructive font-medium' : 'text-green-600 font-medium'}
                    >
                      {project.spi.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="w-24" />
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
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
                          <DropdownMenuItem onClick={() => handleEdit(project)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSelectedProjectId(project.id)}>
                            <Workflow className="mr-2 h-4 w-4" />
                            Work Breakdown Structure
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteProjectId(project.id)}
                          >
                            <Archive className="mr-2 h-4 w-4" />
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
      
      {/* Project Form Dialog */}
      <ProjectForm
        project={editingProject || undefined}
        isOpen={isFormOpen}
        onClose={handleFormClose}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProjectId} onOpenChange={() => setDeleteProjectId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the project
              and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteProjectId && handleDelete(deleteProjectId)}
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
