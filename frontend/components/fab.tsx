"use client";

import { Plus } from "lucide-react";
import Link from "next/link";

export function Fab() {
   return (
      <Link
         data-print-hide
         href="/assignments/create"
         className="fixed bottom-28 right-5 flex size-12 items-center justify-center w-12 rounded-full bg-white text-orange-500 shadow-lg transition-transform active:scale-95 lg:hidden"
         aria-label="Create Assignment"
      >
         <Plus className="size-6" strokeWidth={2} />
      </Link>
   );
}
