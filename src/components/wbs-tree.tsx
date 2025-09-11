"use client";

import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  User,
  Calendar,
  DollarSign,
  Target,
  ListTodo,
  Folder,
  FileText
} from "lucide-react";

import { WBSTask } from '@/lib/types';

interface WBSTreeProps {
  projectId: string;
  tasks: WBSTask[];
  onTasksChange: (tasks: WBSTask[]) => void;
  users: Array<{ id: string; name: string }>;
}

export function WBSTree({ projectId, tasks, onTasksChange, users }: WBSTreeProps) {
  const { toast } = useToast();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [editingTask, setEditingTask] = useState<WBSTask | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);

  const toggleExpand = useCallback((taskId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  const findTaskById = useCallback((tasks: WBSTask[], taskId: string): WBSTask | null => {
    for (const task of tasks) {
      if (task.id === taskId) return task;
      const found = findTaskById(task.children, taskId);
      if (found) return found;
    }
    return null;
  }, []);

  const updateTaskInTree = useCallback((tasks: WBSTask[], taskId: string, updates: Partial<WBSTask>): WBSTask[] => {
    return tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updates };
      }
      if (task.children.length > 0) {
        return {
          ...task,
          children: updateTaskInTree(task.children, taskId, updates)
        };
      }
      return task;
    });
  }, []);

  const addTaskToTree = useCallback((tasks: WBSTask[], newTask: WBSTask, parentId?: string): WBSTask[] => {
    if (!parentId) {
      return [...tasks, newTask];
    }

    return tasks.map(task => {
      if (task.id === parentId) {
        return {
          ...task,
          children: [...task.children, newTask]
        };
      }
      if (task.children.length > 0) {
        return {
          ...task,
          children: addTaskToTree(task.children, newTask, parentId)
        };
      }
      return task;
    });
  }, []);

  const removeTaskFromTree = useCallback((tasks: WBSTask[], taskId: string): WBSTask[] => {
    return tasks.filter(task => {
      if (task.id === taskId) return false;
      if (task.children.length > 0) {
        task.children = removeTaskFromTree(task.children, taskId);
      }
      return true;
    });
  }, []);

  const handleSaveTask = (taskData: Partial<WBSTask>) => {
    const newTask: WBSTask = {
      id: editingTask?.id || `task-${Date.now()}`,
      name: taskData.name || '',
      description: taskData.description || '',
      parentId: parentTaskId || undefined,
      children: editingTask?.children || [],
      type: taskData.type || 'task',
      status: taskData.status || 'not-started',
      priority: taskData.priority || 'medium',
      assignedTo: taskData.assignedTo === 'unassigned' ? undefined : taskData.assignedTo,
      estimatedHours: taskData.estimatedHours || 0,
      actualHours: taskData.actualHours || 0,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      budget: taskData.budget || 0,
      spent: taskData.spent || 0,
      progress: taskData.progress || 0,
      dependencies: taskData.dependencies || [],
      level: parentTaskId ? (findTaskById(tasks, parentTaskId)?.level || 0) + 1 : 0
    };

    let updatedTasks: WBSTask[];
    
    if (editingTask?.id) {
      // Update existing task
      updatedTasks = updateTaskInTree(tasks, editingTask.id, newTask);
    } else {
      // Add new task
      updatedTasks = addTaskToTree(tasks, newTask, parentTaskId || undefined);
    }

    onTasksChange(updatedTasks);
    setEditingTask(null);
    setParentTaskId(null);
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: `Task ${editingTask?.id ? 'updated' : 'created'} successfully!`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const updatedTasks = removeTaskFromTree(tasks, taskId);
    onTasksChange(updatedTasks);
    
    toast({
      title: "Success",
      description: "Task deleted successfully!",
    });
  };

  const handleAddChildTask = (parentId: string) => {
    setParentTaskId(parentId);
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: WBSTask) => {
    setEditingTask(task);
    setParentTaskId(null);
    setIsDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'on-hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'milestone': return Target;
      case 'phase': return Folder;
      default: return ListTodo;
    }
  };

  const renderTask = (task: WBSTask, level: number = 0) => {
    const isExpanded = expandedNodes.has(task.id);
    const hasChildren = task.children.length > 0;
    const TypeIcon = getTypeIcon(task.type);
    const assignedUser = users.find(u => u.id === task.assignedTo);

    return (
      <div key={task.id} className="space-y-2">
        <div 
          className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
          style={{ marginLeft: `${level * 24}px` }}
        >
          <div className="flex items-center space-x-2 flex-1">
            {hasChildren ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(task.id)}
                className="p-1 h-6 w-6"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            ) : (
              <div className="w-6" />
            )}
            
            <TypeIcon className="h-4 w-4 text-muted-foreground" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium truncate">{task.name}</h4>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
                <Badge variant="outline">
                  {task.type}
                </Badge>
              </div>
              
              {task.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {task.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                {assignedUser && (
                  <div className="flex items-center space-x-1">
                    <User className="h-3 w-3" />
                    <span>{assignedUser.name}</span>
                  </div>
                )}
                
                {task.endDate && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(task.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-1">
                  <DollarSign className="h-3 w-3" />
                  <span>${task.spent} / ${task.budget}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right min-w-[100px]">
              <div className="text-sm font-medium">{task.progress}%</div>
              <Progress value={task.progress} className="w-20 h-2" />
            </div>
            
            <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
            
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAddChildTask(task.id)}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditTask(task)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{task.name}"? This will also delete all child tasks.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {task.children.map(child => renderTask(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Work Breakdown Structure</h3>
          <p className="text-sm text-muted-foreground">
            Hierarchical breakdown of project tasks and deliverables
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTask(null);
              setParentTaskId(null);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Root Task
            </Button>
          </DialogTrigger>
          
          <TaskDialog
            task={editingTask}
            parentTaskId={parentTaskId}
            users={users}
            onSave={handleSaveTask}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditingTask(null);
              setParentTaskId(null);
            }}
          />
        </Dialog>
      </div>
      
      <Card>
        <CardContent className="p-4">
          {tasks.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-muted-foreground">No tasks yet</h4>
              <p className="text-sm text-muted-foreground">
                Start by adding a root task to begin building your WBS
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.map(task => renderTask(task, 0))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface TaskDialogProps {
  task?: WBSTask | null;
  parentTaskId?: string | null;
  users: Array<{ id: string; name: string }>;
  onSave: (task: Partial<WBSTask>) => void;
  onCancel: () => void;
}

function TaskDialog({ task, parentTaskId, users, onSave, onCancel }: TaskDialogProps) {
  const [formData, setFormData] = useState<Partial<WBSTask>>({
    name: task?.name || '',
    description: task?.description || '',
    type: task?.type || 'task',
    status: task?.status || 'not-started',
    priority: task?.priority || 'medium',
    assignedTo: task?.assignedTo || 'unassigned',
    estimatedHours: task?.estimatedHours || 0,
    actualHours: task?.actualHours || 0,
    startDate: task?.startDate || '',
    endDate: task?.endDate || '',
    budget: task?.budget || 0,
    spent: task?.spent || 0,
    progress: task?.progress || 0,
  });

  // When editing a task, ensure the form is populated with its latest values
  React.useEffect(() => {
    setFormData({
      name: task?.name || '',
      description: task?.description || '',
      type: task?.type || 'task',
      status: task?.status || 'not-started',
      priority: task?.priority || 'medium',
      assignedTo: task?.assignedTo || 'unassigned',
      estimatedHours: task?.estimatedHours ?? 0,
      actualHours: task?.actualHours ?? 0,
      startDate: task?.startDate || '',
      endDate: task?.endDate || '',
      budget: task?.budget ?? 0,
      spent: task?.spent ?? 0,
      progress: task?.progress ?? 0,
    });
  }, [task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;
    onSave(formData);
  };

  return (
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {task ? 'Edit Task' : parentTaskId ? 'Add Child Task' : 'Add Root Task'}
        </DialogTitle>
        <DialogDescription>
          {parentTaskId && 'This task will be added as a child of the selected parent task.'}
        </DialogDescription>
      </DialogHeader>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="name">Task Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter task name"
              required
            />
          </div>
          
          <div className="col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description..."
              rows={3}
            />
          </div>
          
          <div>
            <Label htmlFor="type">Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="milestone">Milestone</SelectItem>
                <SelectItem value="phase">Phase</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="assignedTo">Assigned To</Label>
            <Select
              value={formData.assignedTo}
              onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              type="number"
              value={formData.estimatedHours}
              onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: Number(e.target.value) }))}
              min="0"
              step="0.5"
            />
          </div>
          
          <div>
            <Label htmlFor="actualHours">Actual Hours</Label>
            <Input
              id="actualHours"
              type="number"
              value={formData.actualHours}
              onChange={(e) => setFormData(prev => ({ ...prev, actualHours: Number(e.target.value) }))}
              min="0"
              step="0.5"
            />
          </div>
          
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          
          <div>
            <Label htmlFor="budget">Budget ($)</Label>
            <Input
              id="budget"
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))}
              min="0"
              step="100"
            />
          </div>
          
          <div>
            <Label htmlFor="spent">Spent ($)</Label>
            <Input
              id="spent"
              type="number"
              value={formData.spent}
              onChange={(e) => setFormData(prev => ({ ...prev, spent: Number(e.target.value) }))}
              min="0"
              step="100"
            />
          </div>
          
          <div>
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              value={formData.progress}
              onChange={(e) => setFormData(prev => ({ ...prev, progress: Number(e.target.value) }))}
              min="0"
              max="100"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {task ? 'Update Task' : 'Create Task'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
