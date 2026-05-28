"use client";

import { ChevronDown, FileText, HelpCircle, LayoutGrid, LogOut, Settings, Sparkles, User } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

import { ArrowLeftIcon, type ArrowLeftIconHandle } from "@/components/animated-icons/arrow-left-icon";
import { BellIcon, type BellIconHandle } from "@/components/animated-icons/bell-icon";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/lib/mock-data";
import { mainNavItems } from "@/lib/navigation";

function getPageTitle(pathname: string): string {
   const navItem = mainNavItems.find((item) => pathname.startsWith(item.href));
   if (navItem) return navItem.label;

   if (pathname === "/settings") return "Settings";
   return "Dashboard";
}

function isSimpleBreadcrumb(pathname: string): boolean {
   return pathname.startsWith("/assignments/create");
}

function isOutputPage(pathname: string): boolean {
   return /^\/assignments\/[^/]+\/output$/.test(pathname);
}

export function Topbar() {
   const pathname = usePathname();
   const router = useRouter();
   const arrowRef = useRef<ArrowLeftIconHandle>(null);
   const bellRef = useRef<BellIconHandle>(null);
   const pageTitle = getPageTitle(pathname);
   const simpleBreadcrumb = isSimpleBreadcrumb(pathname);
   const outputPage = isOutputPage(pathname);

   return (
      <header className="flex h-14 shrink-0 items-center justify-between rounded-2xl bg-white/75 px-6 shadow-sm">
         {/* Left: Back + Breadcrumb */}
         <div className="flex items-center gap-3">
            <button
               onClick={() => router.back()}
               onMouseEnter={() => arrowRef.current?.startAnimation()}
               onMouseLeave={() => arrowRef.current?.stopAnimation()}
               className="flex size-8 items-center justify-center rounded-full bg-white text-neutral-800 transition-colors hover:bg-neutral-50"
               aria-label="Go back"
            >
               <ArrowLeftIcon ref={arrowRef} size={24} />
            </button>
            {outputPage ? (
               <div className="flex items-center gap-2 text-base text-[#a9a9a9]">
                  <Sparkles className="size-5" strokeWidth={2.5} />
                  <span className="font-semibold tracking-[-0.04em]">
                     Create New
                  </span>
               </div>
            ) : simpleBreadcrumb ? (
               <span className="text-base font-semibold tracking-[-0.04em] text-[#a9a9a9]">
                  {pageTitle}
               </span>
            ) : (
               <div className="flex items-center gap-2 text-base text-[#a9a9a9]">
                  <LayoutGrid className="size-5" strokeWidth={2.5} />
                  <span className="font-semibold tracking-[-0.04em]">
                     {pageTitle}
                  </span>
               </div>
            )}
         </div>

         {/* Right: Notification + User */}
         <div className="flex items-center gap-2.5">
            <button
               onMouseEnter={() => bellRef.current?.startAnimation()}
               onMouseLeave={() => bellRef.current?.stopAnimation()}
               className="relative flex size-10 items-center justify-center rounded-xl bg-[#f6f6f6] text-neutral-800 transition-colors hover:bg-neutral-200"
               aria-label="Notifications"
            >
               <BellIcon ref={bellRef} size={24} />
               <span className="absolute right-2 top-2 size-2 rounded-full bg-orange-500" />
            </button>

            <DropdownMenu>
               <DropdownMenuTrigger className="group flex items-center gap-2 rounded-xl px-2.5 py-1.5 shadow-[-4px_6px_20px_-4px_rgba(0,0,0,0.08)] transition-colors hover:bg-neutral-50 outline-none">
                  <Image
                     src={currentUser.avatar}
                     alt={currentUser.name}
                     width={32}
                     height={32}
                     className="size-8 rounded-full object-cover transition-transform duration-300 group-hover:scale-115"
                  />
                  <div className="flex items-center gap-1">
                     <span className="text-base font-bold text-neutral-700 tracking-[-0.04em]">
                        {currentUser.name}
                     </span>
                     <ChevronDown
                        className="size-6 text-neutral-800 transition-transform duration-300 [[data-popup-open]_&]:rotate-180"
                        strokeWidth={2}
                     />
                  </div>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                     <User className="size-4" />
                     Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/assignments")}>
                     <FileText className="size-4" />
                     Assignments
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                     <Settings className="size-4" />
                     Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                     <HelpCircle className="size-4" />
                     Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive">
                     <LogOut className="size-4" />
                     Logout
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
      </header>
   );
}
