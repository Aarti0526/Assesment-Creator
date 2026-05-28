"use client";

import { Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { BookTextIcon } from "@/components/animated-icons/book-text-icon";
import { ChartPieIcon } from "@/components/animated-icons/chart-pie-icon";
import { FileTextIcon } from "@/components/animated-icons/file-text-icon";
import { SettingsIcon } from "@/components/animated-icons/settings-icon";
import { SparklesIcon, type SparklesIconHandle } from "@/components/animated-icons/sparkles-icon";
import { UsersIcon } from "@/components/animated-icons/users-icon";
import { schoolInfo } from "@/lib/mock-data";
import { mainNavItems } from "@/lib/navigation";
import { useSavedAssignmentsStore } from "@/lib/stores/saved-assignments-store";

import { NavItem, type NavItemProps } from "./nav-item";
import { SchoolInfo } from "./school-info";

const animatedIconMap: Record<string, NavItemProps["animatedIcon"]> = {
   "/groups": UsersIcon,
   "/assignments": FileTextIcon,
   "/toolkit": BookTextIcon,
   "/library": ChartPieIcon,
};

export function Sidebar() {
   const sparklesRef = useRef<SparklesIconHandle>(null);
   const assignmentCount = useSavedAssignmentsStore(
      (s) => s.assignments.length,
   );

   return (
      <aside className="flex w-76 shrink-0 flex-col rounded-2xl bg-white shadow-[6px_0_32px_-2px_rgba(0,0,0,0.2)]" style={{ height: "calc(100% - 12px)" }}>
         {/* Logo */}
         <div className="flex items-center gap-2.5 px-6.5 pt-6">
            <Image
               src="/assets/veda-ai.png"
               alt="VedaAI"
               width={36}
               height={36}
               className="size-10 rounded-lg"
            />
            <span className="text-[28px] font-bold tracking-tight text-neutral-900">
               VedaAI
            </span>
         </div>

         {/* Create Assignment Button */}
         <div className="px-6.5 py-14">
            <Link
               href="/assignments/create"
               onMouseEnter={() => sparklesRef.current?.startAnimation()}
               onMouseLeave={() => sparklesRef.current?.stopAnimation()}
               className="group relative block overflow-hidden rounded-full bg-linear-to-b from-[#FF7950] to-[#C0350A] p-1"
            >
               <div className="flex h-11 items-center justify-center gap-2.5 rounded-full bg-neutral-800 text-base font-medium tracking-[-0.04em] text-white" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                  <SparklesIcon ref={sparklesRef} size={16} />
                  Create Assignment
               </div>
               <div className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-linear-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-in-out group-hover:translate-x-full" />
            </Link>
         </div>

         {/* Navigation */}
         <nav className="flex flex-1 flex-col gap-2 px-6.5">
            {mainNavItems.map((item) => (
               <NavItem
                  key={item.href}
                  {...item}
                  badge={item.href === "/assignments" && assignmentCount > 0 ? assignmentCount : item.badge}
                  animatedIcon={animatedIconMap[item.href]}
               />
            ))}
         </nav>

         {/* Bottom Section */}
         <div className="mt-auto flex flex-col gap-2 px-6.5 pb-6">
            <NavItem label="Settings" href="/settings" icon={Settings} animatedIcon={SettingsIcon} />
            <div className="px-1">
               <SchoolInfo {...schoolInfo} />
            </div>
         </div>
      </aside>
   );
}
