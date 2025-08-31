"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/app-context';
import { useAuth } from '@/contexts/auth-context';
import { TimeEntry } from '@/lib/types';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from 'date-fns';
import { timeEntriesService } from '@/lib/firestore';
import { useToast } from "@/hooks/use-toast";

export default function TimesheetsPage() {
  const { state, dispatch } = useApp();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formData, setFormData] = useState({
    projectId: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    hours: '',
    description: '',
    billable: true,
  });

  // Get current week's days
  const weekDays = useMemo(() => {
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [selectedWeek]);

  // Filter time entries for current user and week
  const weekTimeEntries = useMemo(() => {
    if (!user) return [];
    
    const start = startOfWeek(selectedWeek, { weekStartsOn: 1 });
    const end = endOfWeek(selectedWeek, { weekStartsOn: 1 });
    
    return state.timeEntries.filter(entry => {
      const entryDate = parseISO(entry.date);
      return entry.userId === user.id && 
             entryDate >= start && 
             entryDate <= end;
    });
  }, [state.timeEntries, user, selectedWeek]);

  // Group entries by project and date
  const groupedEntries = useMemo(() => {
    const grouped: { [projectId: string]: { [date: string]: TimeEntry[] } } = {};
    
    weekTimeEntries.forEach(entry => {
      if (!grouped[entry.projectId]) {
        grouped[entry.projectId] = {};
      }
      if (!grouped[entry.projectId][entry.date]) {
        grouped[entry.projectId][entry.date] = [];
      }
      grouped[entry.projectId][entry.date].push(entry);
    });
    
    return grouped;
  }, [weekTimeEntries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const timeEntryData: Omit<TimeEntry, 'id'> = {
        userId: user.id,
        projectId: formData.projectId,
        date: formData.date,
        hours: parseFloat(formData.hours),
        description: formData.description,
        billable: formData.billable,
        approved: false,
        createdAt: new Date().toISOString(),
      };

      if (editingEntry) {
        await timeEntriesService.update(editingEntry.id, timeEntryData);
        dispatch({
          type: 'UPDATE_TIME_ENTRY',
          payload: { id: editingEntry.id, updates: timeEntryData }
        });
        toast({
          title: "Success",
          description: "Time entry updated successfully!",
        });
      } else {
        const id = await timeEntriesService.create(timeEntryData);
        dispatch({
          type: 'ADD_TIME_ENTRY',
          payload: { id, ...timeEntryData }
        });
        toast({
          title: "Success",
          description: "Time entry added successfully!",
        });
      }

      setIsFormOpen(false);
      setEditingEntry(null);
      setFormData({
        projectId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        hours: '',
        description: '',
        billable: true,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save time entry",
      });
    }
  };

  const getTotalHours = (projectId: string, date: string) => {
    return groupedEntries[projectId]?.[date]?.reduce((sum, entry) => sum + entry.hours, 0) || 0;
  };

  const getDayTotal = (date: string) => {
    return weekTimeEntries
      .filter(entry => entry.date === date)
      .reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getWeekTotal = () => {
    return weekTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);
  };

  const getProjectName = (projectId: string) => {
    return state.projects.find(p => p.id === projectId)?.name || 'Unknown Project';
  };

  const canApprove = user?.role === 'PM' || user?.role === 'Admin';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timesheets</h1>
          <p className="text-muted-foreground">
            Track your time and submit for approval.
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Time Entry
        </Button>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Week of {format(startOfWeek(selectedWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
              >
                Previous Week
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedWeek(new Date())}
              >
                Current Week
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSelectedWeek(new Date(selectedWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
              >
                Next Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  {weekDays.map(day => (
                    <TableHead key={day.toISOString()} className="text-center min-w-24">
                      <div>{format(day, 'E')}</div>
                      <div className="text-xs text-muted-foreground">{format(day, 'M/d')}</div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={weekDays.length + 2} className="text-center text-muted-foreground">
                      No projects available
                    </TableCell>
                  </TableRow>
                ) : (
                  state.projects.map(project => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      {weekDays.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const hours = getTotalHours(project.id, dateStr);
                        return (
                          <TableCell key={dateStr} className="text-center">
                            {hours > 0 ? (
                              <Badge variant="secondary" className="cursor-pointer">
                                {hours}h
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        );
                      })}
                      <TableCell className="text-center font-medium">
                        {weekTimeEntries
                          .filter(entry => entry.projectId === project.id)
                          .reduce((sum, entry) => sum + entry.hours, 0)}h
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-medium">Daily Total</TableCell>
                  {weekDays.map(day => (
                    <TableCell key={day.toISOString()} className="text-center font-medium">
                      {getDayTotal(format(day, 'yyyy-MM-dd'))}h
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-primary">
                    {getWeekTotal()}h
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Billable</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {weekTimeEntries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No time entries for this week
                  </TableCell>
                </TableRow>
              ) : (
                weekTimeEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>{format(parseISO(entry.date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>{getProjectName(entry.projectId)}</TableCell>
                      <TableCell>{entry.hours}h</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                      <TableCell>
                        <Badge variant={entry.billable ? "default" : "secondary"}>
                          {entry.billable ? "Billable" : "Non-billable"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.approved ? "default" : "secondary"}>
                          {entry.approved ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Approved
                            </>
                          ) : (
                            <>
                              <XCircle className="mr-1 h-3 w-3" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Time Entry Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingEntry ? 'Edit Time Entry' : 'Add Time Entry'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {state.projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  step="0.25"
                  min="0"
                  max="24"
                  value={formData.hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                required
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="billable"
                checked={formData.billable}
                onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <Label htmlFor="billable">Billable</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingEntry ? 'Update Entry' : 'Add Entry'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
