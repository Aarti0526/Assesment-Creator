import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GeneratedPaper } from "@/lib/api";

export interface SavedAssignment {
   id: string;
   title: string;
   assignedOn: string;
   dueDate?: string;
   generatedPaper?: GeneratedPaper;
}

const defaultAssignments: SavedAssignment[] = [];

interface SavedAssignmentsState {
   assignments: SavedAssignment[];
   addAssignment: (assignment: SavedAssignment) => void;
   removeAssignment: (id: string) => void;
   getAssignment: (id: string) => SavedAssignment | undefined;
}

export const useSavedAssignmentsStore = create<SavedAssignmentsState>()(
   persist(
      (set, get) => ({
         assignments: defaultAssignments,

         addAssignment: (assignment) =>
            set((state) => {
               const exists = state.assignments.some(
                  (a) => a.id === assignment.id,
               );
               if (exists) return state;
               return {
                  assignments: [assignment, ...state.assignments],
               };
            }),

         removeAssignment: (id) =>
            set((state) => ({
               assignments: state.assignments.filter((a) => a.id !== id),
            })),

         getAssignment: (id) =>
            get().assignments.find((a) => a.id === id),
      }),
      {
         name: "veda-saved-assignments",
      },
   ),
);
