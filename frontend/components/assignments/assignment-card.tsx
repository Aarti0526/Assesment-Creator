"use client";

import { EllipsisVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import type { SavedAssignment } from "@/lib/stores/saved-assignments-store";
import { useSavedAssignmentsStore } from "@/lib/stores/saved-assignments-store";

interface AssignmentCardProps {
   assignment: SavedAssignment;
}

export function AssignmentCard({ assignment }: AssignmentCardProps) {
   const [menuOpen, setMenuOpen] = useState(false);
   const menuRef = useRef<HTMLDivElement>(null);
   const router = useRouter();
   const removeAssignment = useSavedAssignmentsStore((s) => s.removeAssignment);

   return (
      <div
         onClick={() => router.push(`/assignments/${assignment.id}/output`)}
         className="relative flex h-29 cursor-pointer flex-col justify-between gap-2 rounded-2xl bg-white p-5 shadow-sm transition-colors duration-200 hover:bg-orange-100/70 lg:h-40 lg:px-6 lg:py-6"
      >
         {/* Title + Kebab */}
         <div className="flex items-start justify-between">
            <h3 className="truncate text-lg font-extrabold tracking-[-0.04em] text-neutral-900 lg:text-2xl">
               {assignment.title}
            </h3>
            <button
               onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
               }}
               className="flex size-8 shrink-0 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
               aria-label="More options"
            >
               <EllipsisVertical className="size-6" strokeWidth={2} />
            </button>
         </div>

         {/* Dates */}
         <div className="flex items-center gap-2.5 text-base tracking-[-0.02em] lg:justify-between lg:gap-4">
            <span className="font-extrabold text-neutral-900">
               Assigned on :{" "}
               <span className="font-normal text-neutral-400">
                  {assignment.assignedOn}
               </span>
            </span>
            {assignment.dueDate ? (
               <span className="font-extrabold text-neutral-900">
                  Due :{" "}
                  <span className="font-normal text-neutral-400">
                     {assignment.dueDate}
                  </span>
               </span>
            ) : null}
         </div>

         {/* Dropdown Menu */}
         {menuOpen ? (
            <>
               <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                     e.stopPropagation();
                     setMenuOpen(false);
                  }}
               />
               <div
                  ref={menuRef}
                  className="absolute right-10 top-10 z-20 h-21 w-35 rounded-xl border border-neutral-100 bg-white p-2 shadow-lg lg:right-14 lg:top-13"
               >
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        router.push(`/assignments/${assignment.id}/output`);
                     }}
                     className="flex w-full items-center gap-2.5 px-0.5 py-1.5 tracking-[-0.04em] text-sm font-medium rounded-lg text-neutral-700 transition-colors hover:bg-neutral-50"
                  >
                     <span className="pl-1">View Assignment</span>
                  </button>
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        removeAssignment(assignment.id);
                     }}
                     className="flex w-full items-center gap-2.5 px-0.5 py-1.5 tracking-[-0.04em] text-sm font-medium rounded-lg text-red-500 transition-colors hover:bg-red-50"
                  >
                     <span className="pl-1">Delete</span>
                  </button>
               </div>
            </>
         ) : null}
      </div>
   );
}
