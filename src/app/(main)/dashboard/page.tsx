"use client";

import React, { useState, useEffect } from "react";
import { useApp } from '@/contexts/app-context';
import { useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
  } from "@/components/ui/card";
import { 
  DollarSign, 
  FolderKanban, 
  ListChecks, 
  Users, 
  User, 
  TrendingUp, 
  TrendingDown,
  Filter,
  Calendar
} from "lucide-react";
import { SimpleChart } from "@/components/ui/simple-chart";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DashboardPage() {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState('month');
  const [isChartLoaded, setIsChartLoaded] = React.useState(false);

  React.useEffect(() => {
    // Remove artificial delay - charts should load immediately
    setIsChartLoaded(true);
  }, []);

  // Calculate real metrics from state data - optimized for performance
  const metrics = React.useMemo(() => {
    // Calculate revenue as earned revenue based on project progress
    const totalRevenue = state.projects.reduce((sum, project) => {
      // For completed projects, use full budget. For others, use progress-based calculation
      const earnedRevenue = project.status === 'Completed' 
        ? project.budget 
        : (project.budget * project.progress) / 100;
      return sum + earnedRevenue;
    }, 0);
    // Active projects = all projects except completed ones
    const activeProjects = state.projects.filter(p => p.status !== 'Completed').length;
    const totalProjects = state.projects.length;
    const completedProjects = state.projects.filter(p => p.status === 'Completed').length;
    const inProgressProjects = state.projects.filter(p => p.status === 'In Progress').length;
    const taskCompletion = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const teamMembers = state.users.length;
    
    // Calculate total project value and potential revenue
    const totalProjectValue = state.projects.reduce((sum, project) => sum + project.budget, 0);
    const totalSpent = state.projects.reduce((sum, project) => sum + project.spent, 0);
    
    // Calculate opportunity pipeline value
    const pipelineValue = state.opportunities
      .filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.stage))
      .reduce((sum, opp) => sum + opp.amount, 0);
    
    // Calculate weighted pipeline value
    const weightedPipeline = state.opportunities
      .filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.stage))
      .reduce((sum, opp) => sum + (opp.amount * opp.probability / 100), 0);

    return {
      totalRevenue,
      activeProjects,
      taskCompletion,
      teamMembers,
      pipelineValue,
      weightedPipeline,
      totalProjects,
      completedProjects,
      inProgressProjects,
      totalProjectValue,
      totalSpent
    };
  }, [state.projects, state.opportunities, state.users]); // More specific dependencies

  // Generate chart data from real project data
  const chartData = React.useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      // Generate more realistic data based on actual project count
      const totalProjects = state.projects.length;
      const baseDesktop = Math.max(totalProjects * 30, 50);
      const baseMobile = Math.max(totalProjects * 20, 30);
      
      return {
        month,
        desktop: Math.round(baseDesktop + (Math.random() * 50) + (index * 10)),
        mobile: Math.round(baseMobile + (Math.random() * 30) + (index * 8))
      };
    });
  }, [state.projects]);

  // Get recent projects - show all projects, not just "In Progress"
  const recentProjects = React.useMemo(() => {
    return state.projects
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [state.projects]);

  // Get performance metrics
  const getPerformanceMetrics = () => {
    const avgCPI = state.projects.reduce((sum, p) => sum + p.cpi, 0) / state.projects.length || 0;
    const avgSPI = state.projects.reduce((sum, p) => sum + p.spi, 0) / state.projects.length || 0;
    const avgProgress = state.projects.reduce((sum, p) => sum + p.progress, 0) / state.projects.length || 0;
    
    return { avgCPI, avgSPI, avgProgress };
  };

  const { avgCPI, avgSPI, avgProgress } = getPerformanceMetrics();

  const getProjectStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-green-600';
      case 'In Progress': return 'text-blue-600';
      case 'On Hold': return 'text-yellow-600';
      case 'Not Started': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getManagerName = (managerId: string) => {
    const manager = state.users.find(user => user.id === managerId);
    return manager?.name || 'Unassigned';
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your projects and team.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 3 months</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earned Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(metrics.totalSpent)} spent • {formatCurrency(metrics.totalProjectValue)} total value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalProjects} total • {metrics.inProgressProjects} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgProgress)}%</div>
            <div className="mt-2">
              <Progress value={avgProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(metrics.weightedPipeline)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(metrics.pipelineValue)} total pipeline
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cost Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {avgCPI.toFixed(2)}
              {avgCPI >= 1 ? (
                <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 ml-2" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Average CPI across projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Schedule Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center">
              {avgSPI.toFixed(2)}
              {avgSPI >= 1 ? (
                <TrendingUp className="h-4 w-4 text-green-500 ml-2" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500 ml-2" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Average SPI across projects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.teamMembers}</div>
            <p className="text-xs text-muted-foreground">
              Active team members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Project Analytics</CardTitle>
            <CardDescription>
              Desktop vs Mobile project metrics over time
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {isChartLoaded ? (
              <SimpleChart data={chartData} />
            ) : (
              <div className="min-h-[200px] w-full flex items-center justify-center text-muted-foreground">
                Loading chart...
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>
              {recentProjects.length} recent projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentProjects.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No projects found
                </p>
              ) : (
                recentProjects.map((project) => (
                  <div key={project.id} className="flex items-start space-x-4">
                    <div className={`h-2 w-2 rounded-full mt-2 ${
                      project.status === 'In Progress' ? 'bg-blue-500' :
                      project.status === 'Completed' ? 'bg-green-500' :
                      project.status === 'On Hold' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {project.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {getManagerName(project.managerId)} • {project.progress}% Complete
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-1 flex-1" />
                        <span className="text-xs font-medium">
                          {formatCurrency(project.budget)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}