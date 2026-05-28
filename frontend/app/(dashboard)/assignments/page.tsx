"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";

import { PlusIcon, type PlusIconHandle } from "@/components/animated-icons/plus-icon";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { AssignmentToolbar } from "@/components/assignments/assignment-toolbar";
import { EmptyState } from "@/components/empty-state";
import { useSavedAssignmentsStore } from "@/lib/stores/saved-assignments-store";

export default function AssignmentsPage() {
   const router = useRouter();
   const plusRef = useRef<PlusIconHandle>(null);
   const assignments = useSavedAssignmentsStore((s) => s.assignments);

   if (assignments.length === 0) {
      return (
         <EmptyState
            imageSrc="/assets/no-assignment.png"
            imageAlt="No assignments"
            title="No assignments yet"
            description="Create your first assignment to start collecting and grading student submissions. You can set up rubrics, define marking criteria, and let AI assist with grading."
            actionLabel="Create Your First Assignment"
            actionIcon={<PlusIcon size={20} />}
            onAction={() => router.push("/assignments/create")}
         />
      );
   }

   return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
         {/* Sticky Header + Toolbar */}
         <div className="shrink-0 space-y-6 px-0 py-6 pb-4 lg:px-6">
            {/* Mobile Page Header */}
            <div className="relative flex items-center justify-center lg:hidden">
               <button
                  onClick={() => router.back()}
                  className="absolute left-0 flex size-12 items-center justify-center rounded-full bg-white/25"
               >
                  <ArrowLeft
                     className="size-5 text-neutral-800"
                     strokeWidth={2.5}
                  />
               </button>
               <h1 className="text-base font-bold tracking-[-0.04em] text-neutral-900">
                  Assignments
               </h1>
            </div>

            {/* Desktop Page Header */}
            <div className="hidden items-center gap-4 lg:flex">
               <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-green-500" />
               </span>
               <div>
                  <h1 className="text-xl font-bold tracking-[-0.04em] text-neutral-900">
                     Assignments
                  </h1>
                  <p className="mt-1 text-sm tracking-[-0.04em] text-neutral-400">
                     Manage and create assignments for your classes.
                  </p>
               </div>
            </div>

            {/* Toolbar */}
            <AssignmentToolbar />
         </div>

         {/* Scrollable Assignment Grid */}
         <div className="flex-1 overflow-y-auto px-0 pb-24 scrollbar-hide lg:px-6 lg:pb-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
               {assignments.map((assignment) => (
                  <AssignmentCard key={assignment.id} assignment={assignment} />
               ))}
            </div>
         </div>

         {/* Sticky Bottom Blur Bar */}
         <div
            className="pointer-events-none absolute -inset-x-3 bottom-0 z-10 hidden h-25 backdrop-blur-3xl lg:block"
            style={{
               background: "linear-gradient(to bottom, #CACACA00, #BEBEBE)",
               maskImage: "linear-gradient(to bottom, transparent, black)",
               WebkitMaskImage:
                  "linear-gradient(to bottom, transparent, black)",
            }}
         />

         {/* Sticky Bottom Create Button */}
         <div className="absolute -inset-x-3 bottom-1.5 z-20 hidden h-18.25 items-center justify-center lg:flex">
            <Link
               href="/assignments/create"
               onMouseEnter={() => plusRef.current?.startAnimation()}
               onMouseLeave={() => plusRef.current?.stopAnimation()}
               className="group block rounded-full bg-linear-to-b from-[#FFFFFF80] to-[#66666600] p-[1.5px]"
            >
               <div className="relative flex h-11.5 w-52 items-center justify-center gap-2 overflow-hidden rounded-full bg-neutral-900 text-base font-medium tracking-[-0.04em] text-white">
                  <span className="absolute inset-0 bg-linear-to-b from-[#FF7950] to-[#C0350A] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <PlusIcon ref={plusRef} size={20} className="relative z-10" />
                  <span className="relative z-10">Create Assignment</span>
               </div>
            </Link>
         </div>
      </div>
   );
}
