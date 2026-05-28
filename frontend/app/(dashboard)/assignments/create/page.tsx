"use client";

import {
   ArrowLeft,
   ArrowRight,
   CalendarDays,
   Loader2,
   MicOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import {
   MicIcon,
   type MicIconHandle,
} from "@/components/animated-icons/mic-icon";
import {
   PlusIcon,
   type PlusIconHandle,
} from "@/components/animated-icons/plus-icon";
import { FileUpload } from "@/components/assignments/create/file-upload";
import { QuestionTypeRow } from "@/components/assignments/create/question-type-row";
import { StepProgress } from "@/components/assignments/create/step-progress";
import { Calendar } from "@/components/ui/calendar";
import {
   Popover,
   PopoverContent,
   PopoverTrigger,
} from "@/components/ui/popover";
import { assessmentApiService } from "@/lib/api";
import { useSpeechToText } from "@/lib/hooks/use-speech-to-text";
import { useCreateAssignmentStore } from "@/lib/stores/create-assignment-store";

export default function CreateAssignmentPage() {
   const {
      currentStep,
      dueDate,
      questionTypes,
      additionalInfo,
      uploadedFiles,
      totalQuestions,
      totalMarks,
      setDueDate,
      addQuestionType,
      setAdditionalInfo,
   } = useCreateAssignmentStore();

   const router = useRouter();
   const [isSubmitting, setIsSubmitting] = useState(false);
   const addPlusRef = useRef<PlusIconHandle>(null);
   const micRef = useRef<MicIconHandle>(null);

   const { isRecording, isTranscribing, toggleRecording } = useSpeechToText({
      onTranscript: (text) => {
         setAdditionalInfo(additionalInfo ? `${additionalInfo} ${text}` : text);
      },
   });

   async function handleGenerate() {
      if (isSubmitting) return;

      if (uploadedFiles.length === 0) {
         toast.error("No files uploaded", {
            description:
               "Please upload at least one file to generate the assignment.",
         });
         return;
      }

      if (questionTypes.length === 0) {
         toast.error("No question types added", {
            description:
               "Please add at least one question type before generating.",
         });
         return;
      }

      const unselected = questionTypes.some((qt) => !qt.type);
      if (unselected) {
         toast.error("Incomplete question types", {
            description: "Please select a type for all question type rows.",
         });
         return;
      }

      setIsSubmitting(true);
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
         router.push(`/assignments/${res.id}/output`);
      } catch (error) {
         console.error("Failed to create assignment:", error);
         toast.error("Something went wrong", {
            description: "Failed to generate the assignment. Please try again.",
         });
         setIsSubmitting(false);
      }
   }

   return (
      <div className="relative flex flex-1 flex-col overflow-hidden">
         {/* Header */}
         <div className="shrink-0 px-0 pt-6 pb-2 lg:px-6">
            {/* Mobile Header */}
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
                  Create Assignment
               </h1>
            </div>

            {/* Desktop Header */}
            <div className="hidden items-center gap-4 lg:flex">
               <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-green-500" />
               </span>
               <div>
                  <h1 className="text-[20px] font-bold tracking-[-0.04em] text-neutral-900">
                     Create Assignment
                  </h1>
                  <p className="mt-1 text-[14px] tracking-[-0.04em] text-neutral-400">
                     Set up a new assignment for your students
                  </p>
               </div>
            </div>
         </div>

         {/* Step Progress */}
         <div className="shrink-0 px-0 lg:px-6">
            <div className="mx-auto w-full max-w-202.5 py-4">
               <StepProgress currentStep={currentStep} totalSteps={2} />
            </div>
         </div>

         {/* Scrollable Form Content */}
         <div className="flex-1 overflow-y-auto px-0 pb-6 scrollbar-hide lg:px-6">
            {/* White Form Container */}
            <div className="mx-auto w-full max-w-202.5 rounded-4xl border-2 border-white bg-white/50 p-5 lg:p-8">
               {/* Section Title */}
               <div className="mb-6">
                  <h2 className="text-[20px] font-bold tracking-[-0.04em] text-neutral-900">
                     Assignment Details
                  </h2>
                  <p className="mt-0.5 text-[14px] tracking-[-0.04em] text-neutral-400">
                     Basic information about your assignment
                  </p>
               </div>

               {/* File Upload */}
               <FileUpload />

               {/* Due Date */}
               <div className="mt-6">
                  <label className="mb-1.5 block text-[16px] font-bold tracking-[-0.04em] text-neutral-700">
                     Due Date
                  </label>
                  <Popover>
                     <PopoverTrigger className="flex h-11 w-full items-center rounded-4xl border border-neutral-300/50 bg-white px-3">
                        <span
                           className={`flex-1 text-left text-sm tracking-[-0.04em] ${dueDate ? "text-neutral-700" : "text-neutral-400"}`}
                        >
                           {dueDate
                              ? new Date(dueDate).toLocaleDateString("en-GB", {
                                   day: "2-digit",
                                   month: "2-digit",
                                   year: "numeric",
                                })
                              : "Select due date"}
                        </span>
                        <CalendarDays
                           className="size-4.5 text-neutral-800"
                           strokeWidth={2.5}
                        />
                     </PopoverTrigger>
                     <PopoverContent align="start" className="w-auto p-0">
                        <Calendar
                           mode="single"
                           selected={dueDate ? new Date(dueDate) : undefined}
                           onSelect={(date) =>
                              setDueDate(
                                 date
                                    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                                    : "",
                              )
                           }
                           disabled={{ before: new Date() }}
                        />
                     </PopoverContent>
                  </Popover>
               </div>

               {/* Question Types */}
               <div className="mt-8">
                  {/* Header - Desktop only */}
                  <div className="mb-4 hidden items-center justify-between lg:flex">
                     <div className="flex w-117.75 items-center">
                        <span className="text-[16px] font-bold tracking-[-0.04em] text-neutral-700">
                           Question Type
                        </span>
                     </div>
                     <div className="flex items-center gap-3">
                        <span className="w-30 text-center text-[16px] font-medium tracking-[-0.04em] text-neutral-700">
                           No. of Questions
                        </span>
                        <span className="w-25 text-center text-[16px] font-medium tracking-[-0.04em] text-neutral-700">
                           Marks
                        </span>
                     </div>
                  </div>

                  {/* Mobile Header */}
                  <h3 className="mb-4 text-[16px] font-bold tracking-[-0.04em] text-neutral-700 lg:hidden">
                     Question Type
                  </h3>

                  {/* Rows */}
                  <div className="space-y-3 lg:space-y-3">
                     {questionTypes.map((qt) => (
                        <QuestionTypeRow key={qt.id} {...qt} />
                     ))}
                  </div>

                  {/* Add Question Type */}
                  <button
                     type="button"
                     onClick={addQuestionType}
                     onMouseEnter={() => addPlusRef.current?.startAnimation()}
                     onMouseLeave={() => addPlusRef.current?.stopAnimation()}
                     className="mt-4 flex items-center gap-3 text-[16px] font-semibold tracking-[-0.04em] text-neutral-700 transition-colors hover:text-neutral-900"
                  >
                     <span className="flex size-9 items-center justify-center rounded-full bg-neutral-900 text-white">
                        <PlusIcon ref={addPlusRef} size={20} />
                     </span>
                     Add Question Type
                  </button>

                  {/* Totals */}
                  <div className="mt-4 flex flex-col items-end gap-0.5 text-[16px] tracking-[-0.04em]">
                     <span className="font-medium text-neutral-700">
                        Total Questions : {totalQuestions()}
                     </span>
                     <span className="font-medium text-neutral-700">
                        Total Marks : {totalMarks()}
                     </span>
                  </div>
               </div>

               {/* Additional Information */}
               <div className="mt-8">
                  <h3 className="text-[16px] font-bold tracking-[-0.04em] text-neutral-700">
                     Additional Information (For better output)
                  </h3>
                  <div className="relative mt-2">
                     <textarea
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                        placeholder="eg: Generate a question paper for 3 hour exam duration..."
                        rows={4}
                        className="w-full resize-none rounded-4xl border-2 border-dashed border-[#dadada]/40 bg-white/25 px-4 py-3 pr-12 text-sm tracking-[-0.04em] text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-300"
                     />
                     <button
                        type="button"
                        onClick={toggleRecording}
                        onMouseEnter={() =>
                           !isRecording && micRef.current?.startAnimation()
                        }
                        onMouseLeave={() =>
                           !isRecording && micRef.current?.stopAnimation()
                        }
                        disabled={isTranscribing}
                        className={`absolute bottom-5 right-3 flex size-9 items-center justify-center rounded-full transition-colors ${
                           isRecording
                              ? "animate-pulse bg-red-500 text-white"
                              : isTranscribing
                                ? "bg-neutral-200 text-neutral-400"
                                : "bg-white text-neutral-800 hover:text-neutral-400"
                        }`}
                     >
                        {isTranscribing ? (
                           <Loader2 className="size-4 animate-spin" />
                        ) : isRecording ? (
                           <MicOff className="size-5" strokeWidth={2} />
                        ) : (
                           <MicIcon ref={micRef} size={20} />
                        )}
                     </button>
                  </div>
               </div>
            </div>

            {/* Bottom Buttons */}
            <div className="mx-auto flex w-full max-w-202.5 items-center justify-center gap-4 pt-6 lg:justify-between">
               <button
                  type="button"
                  className="flex h-11 items-center gap-2 rounded-full bg-white px-7 text-sm font-medium tracking-[-0.04em] text-neutral-900 transition-colors hover:bg-neutral-100"
               >
                  <ArrowLeft className="size-4" strokeWidth={2.5} />
                  Previous
               </button>
               <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isSubmitting}
                  className="flex h-11 items-center gap-2 rounded-full bg-neutral-900 px-7 text-sm font-medium tracking-[-0.04em] text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
               >
                  {isSubmitting ? (
                     <>
                        <Loader2
                           className="size-4 animate-spin"
                           strokeWidth={2.5}
                        />
                        Generating...
                     </>
                  ) : (
                     <>
                        Next
                        <ArrowRight className="size-4" strokeWidth={2.5} />
                     </>
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}
