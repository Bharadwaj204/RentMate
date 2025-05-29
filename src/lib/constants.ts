import type { ChoreFrequency, UserRole } from "./types";
import { Home, Settings, LayoutDashboard, ListChecks, CalendarDays, CreditCard, Users } from "lucide-react";

export const APP_NAME = "HomeHarmony";

export const CHORE_FREQUENCIES: ChoreFrequency[] = ["Daily", "Weekly", "Monthly", "Once"];
export const USER_ROLES: UserRole[] = ["Owner", "Member"];

export const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/chores", label: "Chores", icon: ListChecks },
  { href: "/expenses", label: "Expenses", icon: CreditCard },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/household", label: "Household", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const DEFAULT_AVATAR = "https://placehold.co/100x100.png";
