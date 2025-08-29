"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Briefcase,
  Clock,
  LineChart,
  Settings,
  Bot,
} from "lucide-react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  {
    href: "/crm",
    label: "CRM",
    icon: Users,
    subLinks: [
      { href: "/crm/accounts", label: "Accounts" },
      { href: "/crm/opportunities", label: "Opportunities" },
    ],
  },
  { href: "/timesheets", label: "Timesheets", icon: Clock },
  { href: "/reports", label: "Reports", icon: LineChart },
  { href: "/optimize", label: "AI Optimizer", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu className="p-2">
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(link.href) && (link.href !== '/dashboard' || pathname === '/dashboard')}
            className="w-full justify-start"
          >
            <NextLink href={link.href}>
              <link.icon className="mr-2 h-5 w-5" />
              <span>{link.label}</span>
            </NextLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
