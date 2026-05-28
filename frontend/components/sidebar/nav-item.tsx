"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, ForwardRefExoticComponent, RefAttributes } from "react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

interface AnimatedIconHandle {
   startAnimation: () => void;
   stopAnimation: () => void;
}

interface AnimatedIconComponentProps {
   size?: number;
}

export interface NavItemProps {
   label: string;
   href: string;
   icon: LucideIcon;
   animatedIcon?: ForwardRefExoticComponent<AnimatedIconComponentProps & RefAttributes<AnimatedIconHandle>> | ComponentType<AnimatedIconComponentProps>;
   badge?: number;
}

export function NavItem({ label, href, icon: Icon, animatedIcon: AnimatedIcon, badge }: NavItemProps) {
   const pathname = usePathname();
   const isActive = pathname === href;
   const iconRef = useRef<AnimatedIconHandle>(null);

   return (
      <Link
         href={href}
         onMouseEnter={() => iconRef.current?.startAnimation()}
         onMouseLeave={() => iconRef.current?.stopAnimation()}
         className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors",
            isActive
               ? "bg-neutral-100 text-neutral-900"
               : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700",
         )}
      >
         {AnimatedIcon ? (
            <span className="shrink-0">
               <AnimatedIcon ref={iconRef} size={20} />
            </span>
         ) : (
            <Icon className="size-5 shrink-0" strokeWidth="2.5" />
         )}
         <span className="flex-1 font-normal tracking-[-0.04em]">{label}</span>
         {badge ? (
            <span className="flex h-5 items-center justify-center rounded-lg bg-[#FF7950] px-2.5 text-xs font-semibold text-white">
               {badge}
            </span>
         ) : null}
      </Link>
   );
}
