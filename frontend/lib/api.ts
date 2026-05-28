import axios, { type AxiosInstance } from "axios";

export interface CreateAssignmentPayload {
   dueDate?: string;
   questionTypes: {
      type: string;
      numberOfQuestions: number;
      marks: number;
   }[];
   additionalInfo: string;
   files: File[];
}

export interface GeneratedQuestion {
   questionNumber: number;
   text: string;
   difficulty: "Easy" | "Moderate" | "Hard";
   marks: number;
   options?: string[];
}

export interface GeneratedSection {
   title: string;
   instruction: string;
   questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
   schoolName: string;
   subject: string;
   className: string;
   timeAllowed: string;
   maximumMarks: number;
   generalInstruction: string;
   sections: GeneratedSection[];
   answerKey: { questionNumber: number; answer: string }[];
}

export interface AssignmentResponse {
   _id: string;
   dueDate?: string;
   questionTypes: {
      type: string;
      numberOfQuestions: number;
      marks: number;
   }[];
   additionalInfo: string;
   fileNames: string[];
   status: "pending" | "processing" | "completed" | "failed";
   generatedPaper?: GeneratedPaper;
   createdAt: string;
}

export class AssessmentApiService {
   private client: AxiosInstance;

   constructor() {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      this.client = axios.create({
         baseURL: apiBase,
         headers: { "Content-Type": "application/json" },
      });
   }

   /**
    * Sends a multipart form request to create a new AI question paper generation task.
    */
   public async createAssignment(data: CreateAssignmentPayload) {
      const formData = new FormData();
      if (data.dueDate) {
         formData.append("dueDate", data.dueDate);
      }
      formData.append("questionTypes", JSON.stringify(data.questionTypes));
      formData.append("additionalInfo", data.additionalInfo);
      
      for (const file of data.files) {
         formData.append("files", file);
      }

      const res = await this.client.post<{ id: string; status: string; message: string }>(
         "/assignments",
         formData,
         { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data;
   }

   /**
    * Retrieves assessment information and generated paper results by ID.
    */
   public async getAssignment(id: string) {
      const res = await this.client.get<AssignmentResponse>(`/assignments/${id}`);
      return res.data;
   }
}

// Export singleton instance of the API Service
export const assessmentApiService = new AssessmentApiService();
