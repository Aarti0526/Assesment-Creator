"use client";

import { FileText, HelpCircle, LogOut, Settings, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { BellIcon, type BellIconHandle } from "@/components/animated-icons/bell-icon";
import { MenuIcon, type MenuIconHandle } from "@/components/animated-icons/menu-icon";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentUser } from "@/lib/mock-data";

export function MobileTopbar() {
   const router = useRouter();
   const bellRef = useRef<BellIconHandle>(null);
   const menuRef = useRef<MenuIconHandle>(null);

   return (
      <header className="flex h-14 shrink-0 items-center justify-between rounded-2xl bg-white px-4 shadow-sm">
         {/* Left: Logo */}
         <div className="flex items-center gap-2">
            <Image
               src="/assets/veda-ai_dark.png"
               alt="VedaAI"
               width={28}
               height={28}
               className="size-7 rounded-md"
            />
            <span className="text-lg font-bold tracking-tight text-neutral-900">
               VedaAI
            </span>
         </div>

         {/* Right: Notification + Avatar + Hamburger */}
         <div className="flex items-center gap-2">
            <button
               onMouseEnter={() => bellRef.current?.startAnimation()}
               onMouseLeave={() => bellRef.current?.stopAnimation()}
               className="relative flex size-9 items-center justify-center rounded-lg bg-[#f6f6f6] text-neutral-800"
               aria-label="Notifications"
            >
               <BellIcon ref={bellRef} size={20} />
               <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-orange-500" />
            </button>

            <Image
               src={currentUser.avatar}
               alt={currentUser.name}
               width={28}
               height={28}
               className="size-7 rounded-full object-cover"
            />

            <DropdownMenu
               onOpenChange={(open) => {
                  if (open) menuRef.current?.startAnimation();
                  else menuRef.current?.stopAnimation();
               }}
            >
               <DropdownMenuTrigger
                  className="flex size-9 items-center justify-center rounded-lg text-neutral-800 outline-none"
                  aria-label="Menu"
               >
                  <MenuIcon ref={menuRef} size={24} />
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end" sideOffset={8} className="w-52">
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
