import type { LucideIcon } from "lucide-react";
import {
   Book,
   CalendarDays,
   ChartPie,
   FilePlus2,
   FileText,
   LayoutGrid,
   Sparkles,
   Users,
} from "lucide-react";

export interface NavItemConfig {
   label: string;
   href: string;
   icon: LucideIcon;
   badge?: number;
}

export const mainNavItems: NavItemConfig[] = [
   { label: "Home", href: "/home", icon: LayoutGrid },
   { label: "My Groups", href: "/groups", icon: Users },
   { label: "Assignments", href: "/assignments", icon: FileText },
   { label: "AI Teacher's Toolkit", href: "/toolkit", icon: Book },
   { label: "My Library", href: "/library", icon: ChartPie },
];

export const mobileNavItems: NavItemConfig[] = [
   { label: "Home", href: "/home", icon: LayoutGrid },
   { label: "My Groups", href: "/groups", icon: CalendarDays },
   { label: "Library", href: "/library", icon: FilePlus2 },
   { label: "AI Toolkit", href: "/toolkit", icon: Sparkles },
];
