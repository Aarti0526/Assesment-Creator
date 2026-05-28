"use client";

import { Download, FilePlus2, Pencil } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import {
   RefreshCWIcon,
   type RefreshCWIconHandle,
} from "@/components/animated-icons/refresh-cw-icon";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
   type AssignmentResponse,
   assessmentApiService,
   type GeneratedQuestion,
   type GeneratedSection,
} from "@/lib/api";
import { useAssignmentSocket } from "@/lib/hooks/use-socket";
import { currentUser } from "@/lib/mock-data";
import { useCreateAssignmentStore } from "@/lib/stores/create-assignment-store";
import { useSavedAssignmentsStore } from "@/lib/stores/saved-assignments-store";

interface State {
   assignment: AssignmentResponse | null;
   loading: boolean;
}

type Action = { type: "fetched"; data: AssignmentResponse } | { type: "error" };

function reducer(_state: State, action: Action): State {
   switch (action.type) {
      case "fetched":
         return { assignment: action.data, loading: false };
      case "error":
         return { assignment: null, loading: false };
   }
}

function useOnMount(fn: () => void) {
   const called = useRef(false);
   useEffect(() => {
      if (!called.current) {
         called.current = true;
         fn();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);
}

function useOnSocketComplete(
   socketStatus: { status: string; message: string } | null,
   fn: () => void,
) {
   const prevStatus = useRef<string | null>(null);
   useEffect(() => {
      if (
         socketStatus?.status === "completed" &&
         prevStatus.current !== "completed"
      ) {
         fn();
      }
      prevStatus.current = socketStatus?.status ?? null;
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [socketStatus]);
}

export default function OutputPage() {
   const params = useParams();
   const router = useRouter();
   const id = params.id as string;

   const [{ assignment, loading }, dispatch] = useReducer(reducer, {
      assignment: null,
      loading: true,
   });

   const socketStatus = useAssignmentSocket(id);
   const paperRef = useRef<HTMLDivElement>(null);
   const refreshRef = useRef<RefreshCWIconHandle>(null);
   const [showRegenDialog, setShowRegenDialog] = useState(false);
   const [isRegenerating, setIsRegenerating] = useState(false);
   const { dueDate, questionTypes, additionalInfo, uploadedFiles } =
      useCreateAssignmentStore();
   const addSavedAssignment = useSavedAssignmentsStore(
      (s) => s.addAssignment,
   );

   function handleDownloadPDF() {
      window.print();
   }

   const fetchAssignment = useCallback(() => {
      assessmentApiService.getAssignment(id)
         .then((data) => {
            dispatch({ type: "fetched", data });
            if (data.status === "completed" && data.generatedPaper) {
               const paper = data.generatedPaper;
               const today = new Date();
               const assignedOn = `${String(today.getDate()).padStart(2, "0")}-${String(today.getMonth() + 1).padStart(2, "0")}-${today.getFullYear()}`;
               addSavedAssignment({
                  id: data._id,
                  title: `${paper.subject} - ${paper.className}`,
                  assignedOn,
                  dueDate: data.dueDate
                     ? new Date(data.dueDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                       }).replace(/\//g, "-")
                     : undefined,
                  generatedPaper: paper,
               });
            }
         })
         .catch(() => dispatch({ type: "error" }));
   }, [id, addSavedAssignment]);

   useOnMount(fetchAssignment);
   useOnSocketComplete(socketStatus, fetchAssignment);

   // Poll every 5s while still generating (fallback if socket misses the event)
   useEffect(() => {
      const isGenerating =
         loading ||
         assignment?.status === "pending" ||
         assignment?.status === "processing";
      if (!isGenerating) return;

      const interval = setInterval(fetchAssignment, 5000);
      return () => clearInterval(interval);
   }, [loading, assignment?.status, fetchAssignment]);

   async function handleRegenerateSame() {
      setIsRegenerating(true);
      try {
         const res = await assessmentApiService.createAssignment({
            dueDate: dueDate || undefined,
            questionTypes: questionTypes.map((qt) => ({
               type: qt.type,
               numberOfQuestions: qt.numberOfQuestions,
               marks: qt.marks,
            })),
            additionalInfo,
            files: uploadedFiles,
         });
         setShowRegenDialog(false);
         router.push(`/assignments/${res.id}/output`);
      } catch {
         setIsRegenerating(false);
      }
   }

   const paper = assignment?.generatedPaper;
   const isGenerating =
      loading ||
      assignment?.status === "pending" ||
      assignment?.status === "processing";
   const isFailed = assignment?.status === "failed";

   if (isGenerating) {
      return (
         <div className="mb-3 flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto rounded-4xl bg-white p-2.25 scrollbar-hide lg:bg-[#5e5e5e] lg:p-5">
               {/* Skeleton message bar */}
               <div className="flex h-auto min-h-[164px] flex-col gap-3 rounded-4xl bg-neutral-800/80 px-4 py-6 lg:gap-4 lg:px-8">
                  <Skeleton className="h-5 w-3/4 rounded-full bg-neutral-600" />
                  <Skeleton className="h-5 w-1/2 rounded-full bg-neutral-600" />
                  <Skeleton className="mt-2 h-11 w-11 rounded-full bg-neutral-600 lg:w-50" />
               </div>

               {/* Skeleton paper */}
               <div className="my-2.5 rounded-4xl bg-[#f6f6f6] px-6 py-10 lg:mx-auto lg:my-3 lg:bg-white lg:px-16 lg:py-12">
                  {/* School name */}
                  <div className="flex flex-col items-center gap-2">
                     <Skeleton className="h-8 w-72 rounded-full bg-neutral-200" />
                     <Skeleton className="h-6 w-48 rounded-full bg-neutral-200" />
                     <Skeleton className="h-6 w-36 rounded-full bg-neutral-200" />
                  </div>

                  {/* Divider */}
                  <div className="mt-6 border-b border-neutral-200" />

                  {/* Time & Marks */}
                  <div className="mt-4 flex items-center justify-between">
                     <Skeleton className="h-5 w-44 rounded-full bg-neutral-200" />
                     <Skeleton className="h-5 w-44 rounded-full bg-neutral-200" />
                  </div>

                  {/* General instruction */}
                  <Skeleton className="mt-4 h-4 w-full rounded-full bg-neutral-200" />
                  <Skeleton className="mt-2 h-4 w-5/6 rounded-full bg-neutral-200" />

                  {/* Name / Roll / Class fields */}
                  <div className="mt-6 space-y-3">
                     <Skeleton className="h-5 w-64 rounded-full bg-neutral-200" />
                     <Skeleton className="h-5 w-56 rounded-full bg-neutral-200" />
                     <Skeleton className="h-5 w-48 rounded-full bg-neutral-200" />
                  </div>

                  {/* Section 1 */}
                  <div className="mt-10">
                     <Skeleton className="mx-auto h-6 w-40 rounded-full bg-neutral-200" />
                     <Skeleton className="mt-2 h-4 w-72 rounded-full bg-neutral-100" />

                     <div className="mt-5 space-y-5">
                        {[1, 2, 3, 4].map((i) => (
                           <div key={i} className="space-y-1.5">
                              <Skeleton className="h-4 w-full rounded-full bg-neutral-200" />
                              <Skeleton className="h-4 w-4/5 rounded-full bg-neutral-100" />
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Section 2 */}
                  <div className="mt-10">
                     <Skeleton className="mx-auto h-6 w-40 rounded-full bg-neutral-200" />
                     <Skeleton className="mt-2 h-4 w-60 rounded-full bg-neutral-100" />

                     <div className="mt-5 space-y-5">
                        {[1, 2, 3].map((i) => (
                           <div key={i} className="space-y-1.5">
                              <Skeleton className="h-4 w-full rounded-full bg-neutral-200" />
                              <Skeleton className="h-4 w-3/5 rounded-full bg-neutral-100" />
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Generating status */}
                  <div className="mt-10 flex flex-col items-center gap-2">
                     <p className="text-sm font-semibold tracking-[-0.04em] text-neutral-400">
                        {socketStatus?.message ||
                           "Generating Question Paper..."}
                     </p>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   if (isFailed) {
      return (
         <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="text-lg font-semibold tracking-[-0.04em] text-red-600">
               Generation Failed
            </p>
            <p className="text-sm tracking-[-0.04em] text-neutral-400">
               {socketStatus?.message ||
                  "Something went wrong. Please try again."}
            </p>
            <button
               onClick={() => router.push("/assignments/create")}
               className="mt-2 flex h-11 items-center gap-2 rounded-full bg-neutral-900 px-7 text-sm font-medium text-white"
            >
               Try Again
            </button>
         </div>
      );
   }

   if (!paper) {
      return (
         <div className="flex flex-1 items-center justify-center">
            <p className="text-neutral-400">No data available</p>
         </div>
      );
   }

   const firstName = currentUser.name.split(" ")[0];

   return (
      <div className="mb-3 flex flex-1 flex-col overflow-hidden">
         {/* Full dashboard area with dark bg */}
         <div
            data-print-wrapper
            className="flex-1 overflow-y-auto rounded-4xl bg-white p-2.25 scrollbar-hide lg:bg-[#5e5e5e] lg:p-5"
         >
            {/* Message bar */}
            <div
               data-print-hide
               className="flex h-41 flex-col gap-3 rounded-4xl px-4 py-6 lg:gap-4 lg:px-8"
               style={{
                  backgroundColor: "rgba(24, 24, 24, 0.8)",
                  height: "auto",
                  minHeight: "164px",
               }}
            >
               <p className="text-[14px] font-bold leading-relaxed text-white lg:text-[20px]">
                  Certainly, {firstName}! Here are customized Question Paper for
                  your {paper.className} {paper.subject} classes on the NCERT
                  chapters:
               </p>
               <button
                  onClick={handleDownloadPDF}
                  className="group relative flex h-11 w-11 shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#5e5e5e] text-[16px] font-medium text-white lg:w-50 lg:bg-white lg:text-neutral-900"
               >
                  <span className="absolute inset-0 bg-linear-to-b from-[#FF7950] to-[#C0350A] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <Download
                     className="relative z-10 size-5 lg:hidden"
                     strokeWidth={2}
                  />
                  <FilePlus2
                     className="relative z-10 hidden size-5 transition-colors duration-500 group-hover:text-white lg:block"
                     strokeWidth={2}
                  />
                  <span className="relative z-10 hidden transition-colors duration-500 group-hover:text-white lg:block">
                     Download as PDF
                  </span>
               </button>
            </div>

            {/* Paper output container */}
            <div
               ref={paperRef}
               data-print-paper
               className="my-2.5 rounded-4xl bg-[#f6f6f6] px-6 py-10 lg:mx-auto lg:my-3 lg:bg-white lg:px-16 lg:py-12"
               style={{ fontFamily: "var(--font-inter), sans-serif" }}
            >
               {/* School Name */}
               <h1 className="text-center text-[24px] font-bold text-neutral-900 lg:text-[32px]">
                  {paper.schoolName}
               </h1>

               {/* Subject */}
               <p className="mt-1 text-center text-[18px] font-semibold text-neutral-900 lg:text-[24px]">
                  Subject: {paper.subject}
               </p>

               {/* Class */}
               <p className="text-center text-[18px] font-semibold text-neutral-900 lg:text-[24px]">
                  Class: {paper.className}
               </p>

               {/* Divider */}
               <hr className="mt-6 border-neutral-300" />

               {/* Time & Marks row */}
               <div className="mt-4 flex items-center justify-between text-[14px] font-semibold text-neutral-900 lg:text-[18px]">
                  <span>Time Allowed: {paper.timeAllowed}</span>
                  <span>Maximum Marks: {paper.maximumMarks}</span>
               </div>

               {/* General Instructions */}
               {paper.generalInstruction && (
                  <p className="mt-4 text-[14px] text-neutral-900 lg:text-[18px]">
                     {paper.generalInstruction}
                  </p>
               )}

               {/* Name, Roll No, Section fields */}
               <div className="mt-6 space-y-3 text-[14px] font-bold text-neutral-900 lg:text-[18px]">
                  <div className="flex items-baseline gap-1">
                     <span className="shrink-0">Name:</span>
                     <span className="w-56 border-b border-neutral-800" />
                  </div>
                  <div className="flex items-baseline gap-1">
                     <span className="shrink-0">Roll Number:</span>
                     <span className="w-42 border-b border-neutral-800" />
                  </div>
                  <div className="flex items-baseline gap-1">
                     <span className="shrink-0">Class:</span>
                     <span className="w-16 border-b border-neutral-800" />
                     <span className="shrink-0 pl-4">Section:</span>
                     <span className="w-16 border-b border-neutral-800" />
                  </div>
               </div>

               {/* Sections */}
               <div className="mt-10 space-y-10">
                  {paper.sections.map(
                     (section: GeneratedSection, sIdx: number) => (
                        <div key={sIdx}>
                           {/* Section Title */}
                           <h2 className="text-center text-[18px] font-bold text-neutral-900 lg:text-[24px]">
                              {section.title}
                           </h2>

                           {/* Section Instruction */}
                           <p className="mt-1 text-[13px] italic text-neutral-500 lg:text-[16px]">
                              {section.instruction}
                           </p>

                           {/* Questions */}
                           <div className="mt-5 space-y-5">
                              {section.questions.map((q: GeneratedQuestion) => (
                                 <div key={q.questionNumber} className="group/item flex flex-col gap-2 rounded-xl border border-transparent p-2 transition-colors hover:bg-neutral-50/50 lg:flex-row lg:items-start lg:gap-4 lg:p-3">
                                    <div className="flex-1">
                                       {/* Question Text */}
                                       <div className="text-[14px] leading-relaxed text-neutral-900 lg:text-[18px]">
                                          <span className="font-bold text-neutral-800">{q.questionNumber}.</span> {q.text}
                                       </div>
                                       
                                       {/* MCQ / True-False options */}
                                       {q.options && q.options.length > 0 && (
                                          <div className="mt-2 ml-5 space-y-1.5 text-[13px] text-neutral-800 lg:ml-7 lg:text-[16px]">
                                             {q.options.map((opt: string, oIdx: number) => (
                                                <p key={oIdx} className="leading-relaxed">{opt}</p>
                                             ))}
                                          </div>
                                       )}
                                    </div>

                                    {/* Badges Container */}
                                    <div className="flex items-center gap-2 shrink-0 select-none lg:pt-1">
                                       {/* Difficulty Badge (visible in UI, hidden on Print) */}
                                       <span
                                          data-print-hide
                                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold transition-all duration-300 ${
                                             q.difficulty.toLowerCase() === "easy"
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : q.difficulty.toLowerCase() === "moderate" || q.difficulty.toLowerCase() === "medium"
                                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                                  : "bg-rose-50 text-rose-700 border border-rose-200"
                                          }`}
                                       >
                                          {q.difficulty}
                                       </span>
                                       {/* Marks Badge (beautiful pill style) */}
                                       <span className="inline-flex items-center rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-bold text-neutral-700 border border-neutral-200 lg:bg-neutral-50">
                                          {q.marks} {q.marks === 1 ? "Mark" : "Marks"}
                                       </span>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ),
                  )}
               </div>

               {/* End of Paper */}
               <p className="mt-4 text-[14px] font-bold text-neutral-800 lg:text-[16px]">
                  End of Question Paper
               </p>

               {/* Answer Key */}
               {paper.answerKey && paper.answerKey.length > 0 && (
                  <div className="mt-8 border-t border-neutral-300 pt-6">
                     <h2 className="text-[18px] font-bold text-neutral-900 lg:text-[24px]">
                        Answer Key:
                     </h2>
                     <div className="mt-4 space-y-2 text-[13px] text-neutral-800 lg:text-[16px]">
                        {paper.answerKey.map(
                           (a: { questionNumber: number; answer: string }) => (
                              <p key={a.questionNumber}>
                                 <span className="font-semibold">
                                    {a.questionNumber}.
                                 </span>{" "}
                                 {a.answer}
                              </p>
                           ),
                        )}
                     </div>
                  </div>
               )}
            </div>

            {/* Regenerate Button */}
            <div data-print-hide className="my-4 flex justify-center">
               <button
                  onClick={() => setShowRegenDialog(true)}
                  onMouseEnter={() => refreshRef.current?.startAnimation()}
                  onMouseLeave={() => refreshRef.current?.stopAnimation()}
                  className="group relative flex h-11 items-center gap-2 overflow-hidden rounded-full bg-neutral-900 px-7 text-sm font-medium tracking-[-0.04em] text-white"
               >
                  <span className="absolute inset-0 bg-linear-to-b from-[#FF7950] to-[#C0350A] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="relative z-10">
                     <RefreshCWIcon ref={refreshRef} size={18} />
                  </span>
                  <span className="relative z-10">Regenerate</span>
               </button>
            </div>
         </div>

         {/* Regenerate Dialog */}
         <Dialog open={showRegenDialog} onOpenChange={setShowRegenDialog}>
            <DialogContent className="rounded-3xl sm:max-w-md">
               <DialogHeader>
                  <DialogTitle className="text-lg font-bold tracking-[-0.04em]">
                     Regenerate Question Paper
                  </DialogTitle>
                  <DialogDescription>
                     Would you like to regenerate with the same settings or go
                     back to edit your options first?
                  </DialogDescription>
               </DialogHeader>
               <div className="mt-2 flex flex-col gap-3">
                  <button
                     onClick={handleRegenerateSame}
                     disabled={isRegenerating}
                     className="group relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full bg-neutral-900 text-sm font-medium tracking-[-0.04em] text-white disabled:opacity-60"
                  >
                     <span className="absolute inset-0 bg-linear-to-b from-[#FF7950] to-[#C0350A] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                     <RefreshCWIcon size={16} className="relative z-10" />
                     <span className="relative z-10">
                        {isRegenerating ? "Regenerating..." : "Regenerate with Same Options"}
                     </span>
                  </button>
                  <button
                     onClick={() => {
                        setShowRegenDialog(false);
                        router.push("/assignments/create");
                     }}
                     className="flex h-11 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white text-sm font-medium tracking-[-0.04em] text-neutral-900 transition-colors hover:bg-neutral-50"
                  >
                     <Pencil className="size-4" />
                     Edit & Regenerate
                  </button>
               </div>
            </DialogContent>
         </Dialog>
      </div>
   );
}
