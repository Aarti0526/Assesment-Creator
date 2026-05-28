"use client";

import { ChevronDown, Minus, Plus, X } from "lucide-react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { useRef, useState } from "react";

import {
   questionTypeOptions,
   useCreateAssignmentStore,
} from "@/lib/stores/create-assignment-store";

const chevronTransition: Transition = { duration: 0.3, ease: "easeInOut" };

interface QuestionTypeRowProps {
   id: string;
   type: string;
   numberOfQuestions: number;
   marks: number;
}

function Counter({
   value,
   onChange,
   min = 0,
   dark = false,
}: {
   value: number;
   onChange: (v: number) => void;
   min?: number;
   dark?: boolean;
}) {
   const iconColor = dark ? "text-neutral-600" : "text-neutral-300";
   const prevValue = useRef(value);
   const direction = value > prevValue.current ? 1 : -1;
   prevValue.current = value;

   return (
      <div className="flex h-11 w-25 items-center rounded-full bg-white">
         <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            className={`flex h-full flex-1 items-center justify-center ${iconColor} hover:text-neutral-900 transition-colors`}
         >
            <Minus className="size-3.5" strokeWidth={2.5} />
         </button>
         <div className="relative h-5 w-5 shrink-0 overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
               <motion.span
                  key={value}
                  initial={{ y: direction * 20, opacity: 0, filter: "blur(2px)" }}
                  animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                  exit={{ y: direction * -20, opacity: 0, filter: "blur(2px)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute inset-0 flex items-center justify-center text-sm font-medium text-neutral-700"
               >
                  {value}
               </motion.span>
            </AnimatePresence>
         </div>
         <button
            type="button"
            onClick={() => onChange(value + 1)}
            className={`flex h-full flex-1 items-center justify-center ${iconColor} hover:text-neutral-900 transition-colors`}
         >
            <Plus className="size-3.5" strokeWidth={2.5} />
         </button>
      </div>
   );
}

export function QuestionTypeRow({
   id,
   type,
   numberOfQuestions,
   marks,
}: QuestionTypeRowProps) {
   const { updateQuestionType, removeQuestionType } =
      useCreateAssignmentStore();
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const dropdownRef = useRef<HTMLDivElement>(null);

   return (
      <>
         {/* Desktop Layout */}
         <div className="hidden items-center justify-between lg:flex">
            {/* Type Selector + Remove */}
            <div className="flex w-117.75 items-center gap-3">
               <div className="relative flex-1">
                  <button
                     type="button"
                     onClick={() => setDropdownOpen(!dropdownOpen)}
                     className="flex h-11 w-full items-center justify-between rounded-full bg-white px-4 text-[16px] tracking-[-0.04em] text-neutral-700 transition-colors hover:bg-neutral-200"
                  >
                     <span
                        className={
                           type ? "text-neutral-700" : "text-neutral-400"
                        }
                     >
                        {type || "Select question type"}
                     </span>
                     <motion.span
                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                        transition={chevronTransition}
                     >
                        <ChevronDown
                           className="size-4 text-neutral-800"
                           strokeWidth={2}
                        />
                     </motion.span>
                  </button>

                  {dropdownOpen ? (
                     <>
                        <div
                           className="fixed inset-0 z-10"
                           onClick={() => setDropdownOpen(false)}
                        />
                        <div
                           ref={dropdownRef}
                           className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-neutral-100 bg-white py-1 shadow-lg"
                        >
                           {questionTypeOptions.map((option) => (
                              <button
                                 key={option}
                                 type="button"
                                 onClick={() => {
                                    updateQuestionType(id, "type", option);
                                    setDropdownOpen(false);
                                 }}
                                 className="flex w-full px-4 py-2 text-left text-sm tracking-[-0.04em] text-neutral-700 transition-colors hover:bg-neutral-50"
                              >
                                 {option}
                              </button>
                           ))}
                        </div>
                     </>
                  ) : null}
               </div>

               {/* Remove */}
               <button
                  type="button"
                  onClick={() => removeQuestionType(id)}
                  className="flex size-6 shrink-0 items-center justify-center text-neutral-700 transition-colors hover:text-red-500"
               >
                  <X className="size-4" strokeWidth={2.5} />
               </button>
            </div>

            {/* Counters */}
            <div className="flex items-center gap-3">
               <Counter
                  value={numberOfQuestions}
                  onChange={(v) =>
                     updateQuestionType(id, "numberOfQuestions", v)
                  }
                  min={1}
               />
               <Counter
                  value={marks}
                  onChange={(v) => updateQuestionType(id, "marks", v)}
                  min={1}
               />
            </div>
         </div>

         {/* Mobile Layout - Card */}
         <div className="flex flex-col gap-3 rounded-3xl bg-white p-4 lg:hidden">
            {/* Selector + X */}
            <div className="flex items-center gap-3">
               <div className="relative flex-1">
                  <button
                     type="button"
                     onClick={() => setDropdownOpen(!dropdownOpen)}
                     className="flex h-11 w-full items-center gap-6 rounded-full bg-white px-0 lg:px-4 text-sm font-medium tracking-[-0.04em] text-neutral-700"
                  >
                     <span
                        className={
                           type ? "text-neutral-700" : "text-neutral-400"
                        }
                     >
                        {type || "Select question type"}
                     </span>
                     <motion.span
                        animate={{ rotate: dropdownOpen ? 180 : 0 }}
                        transition={chevronTransition}
                     >
                        <ChevronDown
                           className="size-4 text-neutral-800"
                           strokeWidth={2}
                        />
                     </motion.span>
                  </button>

                  {dropdownOpen ? (
                     <>
                        <div
                           className="fixed inset-0 z-10"
                           onClick={() => setDropdownOpen(false)}
                        />
                        <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-xl border border-neutral-100 bg-white py-1 shadow-lg">
                           {questionTypeOptions.map((option) => (
                              <button
                                 key={option}
                                 type="button"
                                 onClick={() => {
                                    updateQuestionType(id, "type", option);
                                    setDropdownOpen(false);
                                 }}
                                 className="flex w-full px-3 py-2 text-left text-sm tracking-[-0.04em] text-neutral-700 transition-colors hover:bg-neutral-50"
                              >
                                 {option}
                              </button>
                           ))}
                        </div>
                     </>
                  ) : null}
               </div>

               <button
                  type="button"
                  onClick={() => removeQuestionType(id)}
                  className="flex size-6 shrink-0 items-center justify-center text-neutral-700 transition-colors hover:text-red-500"
               >
                  <X className="size-4" strokeWidth={2.5} />
               </button>
            </div>

            {/* Labels + Counters */}
            <div className="flex items-center gap-4 rounded-3xl bg-[#f0f0f0] px-1 py-3 lg:p-3">
               <div className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[14px] font-medium tracking-[-0.04em] text-neutral-700">
                     No. of Questions
                  </span>
                  <Counter
                     value={numberOfQuestions}
                     onChange={(v) =>
                        updateQuestionType(id, "numberOfQuestions", v)
                     }
                     min={1}
                     dark
                  />
               </div>
               <div className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[14px] font-medium tracking-[-0.04em] text-neutral-700">
                     Marks
                  </span>
                  <Counter
                     value={marks}
                     onChange={(v) => updateQuestionType(id, "marks", v)}
                     min={1}
                     dark
                  />
               </div>
            </div>
         </div>
      </>
   );
}
