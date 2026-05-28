import { create } from "zustand";

export interface QuestionType {
   id: string;
   type: string;
   numberOfQuestions: number;
   marks: number;
}

export const questionTypeOptions = [
   "Multiple Choice Questions",
   "Short Questions",
   "Long Answer Questions",
   "Diagram/Graph-Based Questions",
   "Numerical Problems",
   "True/False",
];

interface CreateAssignmentState {
   // Step
   currentStep: number;

   // File upload
   uploadedFiles: File[];

   // Form fields
   dueDate: string;

   // Question types
   questionTypes: QuestionType[];

   // Additional info
   additionalInfo: string;

   // Computed
   totalQuestions: () => number;
   totalMarks: () => number;

   // Actions
   setCurrentStep: (step: number) => void;
   addFiles: (files: File[]) => void;
   removeFile: (index: number) => void;
   setDueDate: (date: string) => void;
   addQuestionType: () => void;
   removeQuestionType: (id: string) => void;
   updateQuestionType: (
      id: string,
      field: keyof Pick<QuestionType, "type" | "numberOfQuestions" | "marks">,
      value: string | number,
   ) => void;
   setAdditionalInfo: (info: string) => void;
   reset: () => void;
}

const initialState = {
   currentStep: 1,
   uploadedFiles: [] as File[],
   dueDate: "",
   questionTypes: [
      { id: "1", type: "Multiple Choice Questions", numberOfQuestions: 4, marks: 1 },
      { id: "2", type: "Short Questions", numberOfQuestions: 3, marks: 2 },
      { id: "3", type: "Diagram/Graph-Based Questions", numberOfQuestions: 5, marks: 5 },
      { id: "4", type: "Numerical Problems", numberOfQuestions: 5, marks: 5 },
   ] as QuestionType[],
   additionalInfo: "",
};

let nextId = 5;

export const useCreateAssignmentStore = create<CreateAssignmentState>(
   (set, get) => ({
      ...initialState,

      totalQuestions: () =>
         get().questionTypes.reduce((sum, qt) => sum + qt.numberOfQuestions, 0),

      totalMarks: () =>
         get().questionTypes.reduce(
            (sum, qt) => sum + qt.numberOfQuestions * qt.marks,
            0,
         ),

      setCurrentStep: (step) => set({ currentStep: step }),

      addFiles: (files) =>
         set((state) => ({
            uploadedFiles: [...state.uploadedFiles, ...files],
         })),

      removeFile: (index) =>
         set((state) => ({
            uploadedFiles: state.uploadedFiles.filter((_, i) => i !== index),
         })),

      setDueDate: (date) => set({ dueDate: date }),

      addQuestionType: () =>
         set((state) => ({
            questionTypes: [
               ...state.questionTypes,
               {
                  id: String(nextId++),
                  type: "",
                  numberOfQuestions: 1,
                  marks: 1,
               },
            ],
         })),

      removeQuestionType: (id) =>
         set((state) => ({
            questionTypes: state.questionTypes.filter((qt) => qt.id !== id),
         })),

      updateQuestionType: (id, field, value) =>
         set((state) => ({
            questionTypes: state.questionTypes.map((qt) =>
               qt.id === id ? { ...qt, [field]: value } : qt,
            ),
         })),

      setAdditionalInfo: (info) => set({ additionalInfo: info }),

      reset: () => set(initialState),
   }),
);
