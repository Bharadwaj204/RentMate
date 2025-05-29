import { APP_NAME, DEFAULT_AVATAR, NAV_LINKS } from "@/lib/constants";
import { Home, PanelLeft } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/layout/UserNav";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/placeholder-data";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = getCurrentUser(); // In a real app, this would come from auth context/session

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <aside className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
              <Home className="h-6 w-6" />
              <span className="">{APP_NAME}</span>
            </Link>
          </div>
          <div className="flex-1">
            <SidebarNav />
          </div>
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center gap-3">
               <Avatar className="h-9 w-9">
                <AvatarImage src={currentUser.avatarUrl || DEFAULT_AVATAR} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-primary">
                  <Home className="h-6 w-6" />
                  <span className="">{APP_NAME}</span>
                </Link>
              </div>
              <SidebarNav />
               <div className="mt-auto p-4 border-t">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={currentUser.avatarUrl || DEFAULT_AVATAR} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.split(' ').map(n=>n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{currentUser.role}</p>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Add breadcrumbs or page title here if needed */}
          </div>
          <ThemeToggle />
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
