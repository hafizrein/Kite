"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/contexts/app-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Download,
  Filter
} from "lucide-react";

// CPI/SPI Performance Indicators
const getPerformanceColor = (value: number) => {
  if (value >= 1.1) return "bg-green-500";
  if (value >= 0.9) return "bg-yellow-500";
  return "bg-red-500";
};

const getPerformanceStatus = (cpi: number, spi: number) => {
  if (cpi >= 1.0 && spi >= 1.0) return { status: "Excellent", color: "text-green-600" };
  if (cpi >= 0.9 && spi >= 0.9) return { status: "Good", color: "text-yellow-600" };
  if (cpi >= 0.8 || spi >= 0.8) return { status: "At Risk", color: "text-orange-600" };
  return { status: "Critical", color: "text-red-600" };
};

export default function ReportsPage() {
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState('last30');
  const [selectedManager, setSelectedManager] = useState('all');

  // Filter projects based on selected criteria
  const filteredProjects = useMemo(() => {
    let projects = state.projects || [];
    
    if (selectedManager !== 'all') {
      projects = projects.filter(p => p.managerId === selectedManager);
    }
    
    // Apply date filtering logic here
    return projects;
  }, [state.projects, selectedManager, selectedPeriod]);

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    if (!filteredProjects.length) return {
      avgCPI: 0,
      avgSPI: 0,
      totalBudget: 0,
      totalSpent: 0,
      onTimeProjects: 0,
      totalProjects: 0
    };

    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);
    const avgCPI = filteredProjects.reduce((sum, p) => sum + p.cpi, 0) / filteredProjects.length;
    const avgSPI = filteredProjects.reduce((sum, p) => sum + p.spi, 0) / filteredProjects.length;
    const onTimeProjects = filteredProjects.filter(p => p.spi >= 1.0).length;

    return {
      avgCPI: Math.round(avgCPI * 100) / 100,
      avgSPI: Math.round(avgSPI * 100) / 100,
      totalBudget,
      totalSpent,
      onTimeProjects,
      totalProjects: filteredProjects.length
    };
  }, [filteredProjects]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredProjects.map(project => ({
      name: project.name.length > 20 ? project.name.substring(0, 20) + '...' : project.name,
      cpi: project.cpi,
      spi: project.spi,
      budget: project.budget,
      spent: project.spent,
      progress: project.progress,
      status: project.status
    }));
  }, [filteredProjects]);

  const managers = useMemo(() => {
    const managerSet = new Set(state.projects.map(p => p.managerId));
    return Array.from(managerSet).map(id => {
      const user = state.users.find(u => u.id === id);
      return { id, name: user?.name || 'Unknown Manager' };
    });
  }, [state.projects, state.users]);

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Project Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive project performance analysis with CPI/SPI metrics
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="last90">Last 90 days</SelectItem>
              <SelectItem value="lastYear">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedManager} onValueChange={setSelectedManager}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Managers</SelectItem>
              {managers.map(manager => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average CPI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgCPI}</div>
            <div className={`text-xs ${overallMetrics.avgCPI >= 1.0 ? 'text-green-600' : 'text-red-600'}`}>
              {overallMetrics.avgCPI >= 1.0 ? 'Under budget' : 'Over budget'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average SPI</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallMetrics.avgSPI}</div>
            <div className={`text-xs ${overallMetrics.avgSPI >= 1.0 ? 'text-green-600' : 'text-red-600'}`}>
              {overallMetrics.avgSPI >= 1.0 ? 'Ahead of schedule' : 'Behind schedule'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallMetrics.totalBudget > 0 ? 
                Math.round((overallMetrics.totalSpent / overallMetrics.totalBudget) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              ${overallMetrics.totalSpent.toLocaleString()} / ${overallMetrics.totalBudget.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallMetrics.totalProjects > 0 ? 
                Math.round((overallMetrics.onTimeProjects / overallMetrics.totalProjects) * 100) : 0}%
            </div>
            <div className="text-xs text-muted-foreground">
              {overallMetrics.onTimeProjects} of {overallMetrics.totalProjects} projects
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="heatmap" className="space-y-4">
        <TabsList>
          <TabsTrigger value="heatmap">Performance Heatmap</TabsTrigger>
          <TabsTrigger value="trends">Trends Analysis</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="heatmap" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Performance Heatmap</CardTitle>
              <CardDescription>
                Visual representation of CPI and SPI performance across all projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {chartData.map((project, index) => {
                  const { status, color } = getPerformanceStatus(project.cpi, project.spi);
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium truncate">{project.name}</h4>
                          <Badge variant="outline" className={color}>{status}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <div className="flex items-center justify-between text-sm">
                              <span>CPI: {project.cpi}</span>
                              <div className={`w-3 h-3 rounded-full ${getPerformanceColor(project.cpi)}`}></div>
                            </div>
                            <Progress value={Math.min(project.cpi * 100, 150)} className="mt-1" />
                          </div>
                          <div>
                            <div className="flex items-center justify-between text-sm">
                              <span>SPI: {project.spi}</span>
                              <div className={`w-3 h-3 rounded-full ${getPerformanceColor(project.spi)}`}></div>
                            </div>
                            <Progress value={Math.min(project.spi * 100, 150)} className="mt-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                Historical performance analysis and trend identification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Projects by Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {['Not Started', 'In Progress', 'Completed', 'On Hold'].map(status => {
                        const count = filteredProjects.filter(p => p.status === status).length;
                        const percentage = filteredProjects.length > 0 ? (count / filteredProjects.length) * 100 : 0;
                        return (
                          <div key={status} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{status}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Risk Distribution</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {[
                        { label: 'Low Risk', condition: (p: any) => p.cpi >= 1.0 && p.spi >= 1.0, color: 'bg-green-500' },
                        { label: 'Medium Risk', condition: (p: any) => (p.cpi >= 0.9 && p.cpi < 1.0) || (p.spi >= 0.9 && p.spi < 1.0), color: 'bg-yellow-500' },
                        { label: 'High Risk', condition: (p: any) => p.cpi < 0.9 || p.spi < 0.9, color: 'bg-red-500' }
                      ].map(risk => {
                        const count = filteredProjects.filter(risk.condition).length;
                        const percentage = filteredProjects.length > 0 ? (count / filteredProjects.length) * 100 : 0;
                        return (
                          <div key={risk.label} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${risk.color}`}></div>
                              <span className="text-sm text-muted-foreground">{risk.label}</span>
                            </div>
                            <span className="text-sm font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Budget vs Actual</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Budget</span>
                          <span className="text-sm font-medium">${overallMetrics.totalBudget.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Spent</span>
                          <span className="text-sm font-medium">${overallMetrics.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Variance</span>
                          <span className={`text-sm font-medium ${
                            overallMetrics.totalSpent <= overallMetrics.totalBudget ? 'text-green-600' : 'text-red-600'
                          }`}>
                            ${Math.abs(overallMetrics.totalBudget - overallMetrics.totalSpent).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Project Reports</CardTitle>
              <CardDescription>
                Comprehensive project-by-project analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredProjects.map(project => {
                  const { status, color } = getPerformanceStatus(project.cpi, project.spi);
                  const manager = state.users.find(u => u.id === project.managerId);
                  
                  return (
                    <Card key={project.id} className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Manager: {manager?.name || 'Unassigned'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{project.status}</Badge>
                          <Badge variant="outline" className={color}>{status}</Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Progress</span>
                          <div className="font-medium">{project.progress}%</div>
                          <Progress value={project.progress} className="mt-1" />
                        </div>
                        <div>
                          <span className="text-muted-foreground">CPI</span>
                          <div className={`font-medium ${project.cpi >= 1.0 ? 'text-green-600' : 'text-red-600'}`}>
                            {project.cpi}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">SPI</span>
                          <div className={`font-medium ${project.spi >= 1.0 ? 'text-green-600' : 'text-red-600'}`}>
                            {project.spi}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Budget Usage</span>
                          <div className="font-medium">
                            {project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0}%
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}