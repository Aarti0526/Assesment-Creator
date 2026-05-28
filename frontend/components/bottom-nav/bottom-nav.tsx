"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { mobileNavItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface BottomNavItemProps {
   label: string;
   href: string;
   icon: LucideIcon;
   isActive: boolean;
}

function BottomNavItem({
   label,
   href,
   icon: Icon,
   isActive,
}: BottomNavItemProps) {
   return (
      <Link
         href={href}
         className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-semibold transition-colors",
            isActive ? "text-white" : "text-neutral-400",
         )}
      >
         <Icon className="size-5" strokeWidth={2.5} />
         <span className="tracking-[-0.02em]">{label}</span>
      </Link>
   );
}

export function BottomNav() {
   const pathname = usePathname();

   return (
      <nav className="flex shrink-0 items-center h-18 rounded-4xl bg-[#181818] px-2 mb-2.5 shadow-sm">
         {mobileNavItems.map((item) => (
            <BottomNavItem
               key={item.href}
               {...item}
               isActive={pathname === item.href}
            />
         ))}
      </nav>
   );
}
