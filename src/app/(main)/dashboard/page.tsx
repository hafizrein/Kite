"use client";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
  import { DollarSign, FolderKanban, ListChecks, Users, User } from "lucide-react"
  import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
  } from "@/components/ui/chart"
  import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"

  
  const chartData = [
    { month: "January", desktop: 186, mobile: 80 },
    { month: "February", desktop: 305, mobile: 200 },
    { month: "March", desktop: 237, mobile: 120 },
    { month: "April", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "June", desktop: 214, mobile: 140 },
  ]
  
  const chartConfig = {
    desktop: {
      label: "Desktop",
      color: "hsl(var(--chart-1))",
    },
    mobile: {
      label: "Mobile",
      color: "hsl(var(--chart-2))",
    },
  }
  
  export default function DashboardPage() {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <FolderKanban className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12</div>
              <p className="text-xs text-muted-foreground">
                +2 since last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Tasks</CardTitle>
              <ListChecks className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">57</div>
              <p className="text-xs text-muted-foreground">
                +10 since last week
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+23</div>
              <p className="text-xs text-muted-foreground">
                +3 new this month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />
                                <Legend content={<ChartLegend content={<ChartLegendContent />} />} />
                                <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
                                <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium">Olivia Martin</p>
                                <p className="text-muted-foreground">Updated opportunity "Project Phoenix".</p>
                                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                             <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium">Jackson Lee</p>
                                <p className="text-muted-foreground">Submitted timesheet for week 24.</p>
                                <p className="text-xs text-muted-foreground mt-1">1 day ago</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                             <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-5 w-5" />
                            </div>
                            <div className="text-sm">
                                <p className="font-medium">Isabella Nguyen</p>
                                <p className="text-muted-foreground">Created new project "Kite Mobile App".</p>
                                <p className="text-xs text-muted-foreground mt-1">3 days ago</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    )
  }