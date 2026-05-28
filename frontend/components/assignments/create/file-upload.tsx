"use client";

import { CheckCircle2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { CloudUploadIcon, type CloudUploadIconHandle } from "@/components/animated-icons/cloud-upload-icon";
import { useCreateAssignmentStore } from "@/lib/stores/create-assignment-store";

const ACCEPTED_TYPES = [".jpeg", ".jpg", ".png", ".pdf"];

function formatFileSize(bytes: number): string {
   if (bytes < 1024) return `${bytes} B`;
   if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
   return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileProgress({ file, onComplete }: { file: File; onComplete: () => void }) {
   const [progress, setProgress] = useState(0);
   const done = progress >= 100;

   useEffect(() => {
      // Simulate upload progress based on file size
      const duration = Math.min(300 + file.size / 5000, 2000);
      const steps = 20;
      const stepTime = duration / steps;
      let current = 0;

      const interval = setInterval(() => {
         current += 100 / steps;
         if (current >= 100) {
            setProgress(100);
            clearInterval(interval);
            onComplete();
         } else {
            setProgress(current);
         }
      }, stepTime);

      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   return (
      <div className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3">
         {done ? (
            <CheckCircle2 className="size-5 shrink-0 text-green-500" strokeWidth={2.5} />
         ) : (
            <div className="size-5 shrink-0 animate-spin rounded-full border-2 border-neutral-200 border-t-neutral-600" />
         )}
         <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
               <span className="truncate text-sm font-medium text-neutral-700">
                  {file.name}
               </span>
               <span className="ml-2 shrink-0 text-xs text-neutral-400">
                  {formatFileSize(file.size)}
               </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
               <div
                  className={`h-full rounded-full transition-all duration-200 ease-out ${done ? "bg-green-500" : "bg-neutral-600"}`}
                  style={{ width: `${progress}%` }}
               />
            </div>
         </div>
      </div>
   );
}

export function FileUpload() {
   const { uploadedFiles, addFiles, removeFile } = useCreateAssignmentStore();
   const [isDragging, setIsDragging] = useState(false);
   const [uploadingIndices, setUploadingIndices] = useState<Set<number>>(new Set());
   const inputRef = useRef<HTMLInputElement>(null);
   const uploadIconRef = useRef<CloudUploadIconHandle>(null);

   const handleFiles = useCallback(
      (files: FileList | null) => {
         if (!files) return;
         const startIndex = uploadedFiles.length;
         const newIndices = new Set<number>();
         Array.from(files).forEach((_, i) => newIndices.add(startIndex + i));
         setUploadingIndices((prev) => new Set([...prev, ...newIndices]));
         addFiles(Array.from(files));
      },
      [addFiles, uploadedFiles.length],
   );

   const handleDrop = useCallback(
      (e: React.DragEvent) => {
         e.preventDefault();
         setIsDragging(false);
         handleFiles(e.dataTransfer.files);
      },
      [handleFiles],
   );

   const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
   }, []);

   const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
   }, []);

   return (
      <div className="space-y-3">
         <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onMouseEnter={() => uploadIconRef.current?.startAnimation()}
            onMouseLeave={() => uploadIconRef.current?.stopAnimation()}
            className={`flex h-50.5 flex-col items-center justify-center rounded-4xl border-3 border-dashed border-dash-long px-6 transition-colors ${
               isDragging
                  ? "border-neutral-400 bg-neutral-100"
                  : "border-neutral-200 bg-neutral-50/50"
            }`}
            style={{ borderSpacing: "8px" }}
         >
            <CloudUploadIcon
               ref={uploadIconRef}
               size={24}
               className="mb-3 text-neutral-800"
            />
            <p className="text-[16px] font-medium tracking-[-0.04em] text-neutral-700">
               Choose a file or drag & drop it here
            </p>
            <p className="mt-1 text-[14px] tracking-[-0.04em] text-neutral-400">
               Jpeg, png, pdf, upto 10mb
            </p>
            <button
               type="button"
               onClick={() => inputRef.current?.click()}
               className="mt-4 flex h-9 w-31.75 items-center justify-center rounded-2xl bg-[#f6f6f6] border border-neutral-200 text-[14px] font-medium tracking-[-0.04em] text-neutral-700 transition-all hover:bg-neutral-800 hover:text-white hover:border-neutral-800"
            >
               Browse Files
            </button>
            <input
               ref={inputRef}
               type="file"
               multiple
               accept={ACCEPTED_TYPES.join(",")}
               onChange={(e) => handleFiles(e.target.files)}
               className="hidden"
            />
         </div>

         {uploadedFiles.length > 0 ? (
            <div className="space-y-2">
               {uploadedFiles.map((file, index) =>
                  uploadingIndices.has(index) ? (
                     <FileProgress
                        key={`${file.name}-${index}`}
                        file={file}
                        onComplete={() =>
                           setUploadingIndices((prev) => {
                              const next = new Set(prev);
                              next.delete(index);
                              return next;
                           })
                        }
                     />
                  ) : (
                     <div
                        key={`${file.name}-${index}`}
                        className="flex items-center gap-3 rounded-xl bg-neutral-50 px-4 py-3"
                     >
                        <CheckCircle2 className="size-5 shrink-0 text-green-500" strokeWidth={2.5} />
                        <div className="min-w-0 flex-1">
                           <div className="flex items-center justify-between">
                              <span className="truncate text-sm font-medium text-neutral-700">
                                 {file.name}
                              </span>
                              <span className="ml-2 shrink-0 text-xs text-neutral-400">
                                 {formatFileSize(file.size)}
                              </span>
                           </div>
                           <div className="mt-1.5 h-1.5 w-full rounded-full bg-green-500" />
                        </div>
                        <button
                           type="button"
                           onClick={() => removeFile(index)}
                           className="ml-1 shrink-0 text-xs font-medium text-red-500 hover:text-red-700"
                        >
                           Remove
                        </button>
                     </div>
                  ),
               )}
            </div>
         ) : null}

         <p className="text-center text-[16px] font-medium tracking-[-0.04em] text-neutral-400">
            Upload images of your preferred document/image
         </p>
      </div>
   );
}
