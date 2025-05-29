"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 px-2 py-4">
      {NAV_LINKS.map((link) => {
        const Icon = link.icon as LucideIcon;
        const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
        return (
          <Button
            key={link.label}
            asChild
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              isActive && "bg-primary/10 text-primary hover:bg-primary/20"
            )}
          >
            <Link href={link.href} className="flex items-center gap-3 rounded-lg px-3 py-2 transition-all">
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          </Button>
        );
      })}
    </nav>
  );
}
