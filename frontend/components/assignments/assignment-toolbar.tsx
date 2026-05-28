"use client";

import { Filter, Search } from "lucide-react";

export function AssignmentToolbar() {
   return (
      <div className="flex h-16 items-center justify-between gap-4 rounded-2xl bg-white px-5">
         <button className="flex items-center gap-2 text-sm font-normal tracking-[-0.04em] text-neutral-400 transition-colors hover:text-neutral-700 lg:font-bold">
            <Filter className="size-4" strokeWidth={2.5} />
            <span className="hidden lg:inline">Filter By</span>
            <span className="lg:hidden">Filter</span>
         </button>

         <div className="flex h-11 w-57 items-center gap-3.5 rounded-4xl border border-neutral-200 bg-white px-4 lg:w-95">
            <Search className="size-5 text-neutral-400" strokeWidth={2.5} />
            <input
               type="text"
               placeholder="Search Assignments"
               className="hidden flex-1 bg-transparent text-sm font-bold tracking-[-0.04em] text-neutral-700 placeholder:text-neutral-400 focus:outline-none lg:block"
            />
            <input
               type="text"
               placeholder="Search Name"
               className="flex-1 bg-transparent text-sm font-normal tracking-[-0.04em] text-neutral-700 placeholder:text-neutral-400 focus:outline-none lg:hidden"
            />
         </div>
      </div>
   );
}
