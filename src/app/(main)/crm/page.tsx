"use client";

import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from '@/contexts/app-context';
import { Users, Building, TrendingUp, DollarSign } from "lucide-react";
import Link from "next/link";

export default function CRMPage() {
  const { state } = useApp();

  // No automatic redirect - let users navigate manually

  const totalAccounts = state.accounts.length;
  const totalOpportunities = state.opportunities.length;
  const pipelineValue = state.opportunities
    .filter(opp => !['Closed Won', 'Closed Lost'].includes(opp.stage))
    .reduce((sum, opp) => sum + opp.amount, 0);
  const wonDeals = state.opportunities.filter(opp => opp.stage === 'Closed Won').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customer Relationship Management</h1>
        <p className="text-muted-foreground">
          Manage your accounts, opportunities, and sales pipeline.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAccounts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Opportunities</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOpportunities}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pipelineValue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wonDeals}</div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Accounts Management</CardTitle>
            <CardDescription>
              Manage your customer accounts, contacts, and company information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/crm/accounts">
              <Button className="w-full">
                <Building className="mr-2 h-4 w-4" />
                Go to Accounts
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Opportunities Pipeline</CardTitle>
            <CardDescription>
              Track and manage your sales opportunities and deals.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/crm/opportunities">
              <Button className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Go to Opportunities
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            Redirecting to Accounts in 3 seconds, or choose a section above...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
