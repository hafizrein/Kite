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

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
            <div className="flex items-center gap-2">
                <Logo className="h-8 w-8 text-primary" />
                <span className="text-xl font-headline font-semibold">Kite</span>
            </div>
        </SidebarHeader>
        <SidebarContent className="p-0">
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="border-t p-2">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                </div>
                <div className="flex flex-col text-sm w-full overflow-hidden">
                    <span className="font-semibold text-foreground truncate">John Doe</span>
                    <span className="text-muted-foreground text-xs truncate">john.doe@example.com</span>
                </div>
                <Button variant="ghost" size="icon" className="ml-auto flex-shrink-0">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
