"use client";

import {
  Sidebar,
  SidebarProvider,
  SidebarInset,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/icons/logo";
import { SidebarNav } from "./sidebar-nav";
import { Header } from "./header";
import { Button } from "../ui/button";
import { LogOut, User } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { OrganizationSwitcher, OrganizationProvider } from "@/components/organization-switcher";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);


  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Success",
        description: "Logged out successfully!",
      });
      router.push("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to log out",
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <OrganizationProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader className="border-b">
              <div className="flex items-center gap-2">
                  <Logo className="h-8 w-8 text-primary" />
                  <span className="text-xl font-headline font-semibold">Kite</span>
              </div>
              <div className="mt-3">
                <OrganizationSwitcher />
              </div>
          </SidebarHeader>
          <SidebarContent className="p-0">
            <SidebarNav />
          </SidebarContent>
        <SidebarFooter className="border-t p-2">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                </div>
                <div className="flex flex-col text-sm w-full overflow-hidden">
                    <span className="font-semibold text-foreground truncate">{user.name}</span>
                    <span className="text-muted-foreground text-xs truncate">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
    </OrganizationProvider>
  );
}
