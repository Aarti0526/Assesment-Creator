import mongoose, { type Document, Schema } from "mongoose";

export interface IQuestionType {
   type: string;
   numberOfQuestions: number;
   marks: number;
}

export interface IQuestion {
   questionNumber: number;
   text: string;
   difficulty: "Easy" | "Moderate" | "Hard";
   marks: number;
   options?: string[];
}

export interface ISection {
   title: string;
   instruction: string;
   questions: IQuestion[];
}

export interface IGeneratedPaper {
   schoolName: string;
   subject: string;
   className: string;
   timeAllowed: string;
   maximumMarks: number;
   generalInstruction: string;
   sections: ISection[];
   answerKey: { questionNumber: number; answer: string }[];
}

export interface IFileData {
   name: string;
   mimeType: string;
   data: string; // base64
}

export interface IAssignment extends Document {
   dueDate?: string;
   questionTypes: IQuestionType[];
   additionalInfo: string;
   fileNames: string[];
   fileData: IFileData[];
   status: "pending" | "processing" | "completed" | "failed";
   generatedPaper?: IGeneratedPaper;
   createdAt: Date;
   updatedAt: Date;
}

const questionTypeSchema = new Schema<IQuestionType>(
   {
      type: { type: String, required: true },
      numberOfQuestions: { type: Number, required: true, min: 1 },
      marks: { type: Number, required: true, min: 1 },
   },
   { _id: false },
);

const questionSchema = new Schema<IQuestion>(
   {
      questionNumber: { type: Number, required: true },
      text: { type: String, required: true },
      difficulty: {
         type: String,
         enum: ["Easy", "Moderate", "Hard"],
         required: true,
      },
      marks: { type: Number, required: true },
      options: [String],
   },
   { _id: false },
);

const sectionSchema = new Schema<ISection>(
   {
      title: { type: String, required: true },
      instruction: { type: String, required: true },
      questions: [questionSchema],
   },
   { _id: false },
);

const generatedPaperSchema = new Schema<IGeneratedPaper>(
   {
      schoolName: String,
      subject: String,
      className: String,
      timeAllowed: String,
      maximumMarks: Number,
      generalInstruction: String,
      sections: [sectionSchema],
      answerKey: [
         {
            questionNumber: Number,
            answer: String,
            _id: false,
         },
      ],
   },
   { _id: false },
);

const assignmentSchema = new Schema<IAssignment>(
   {
      dueDate: String,
      questionTypes: [questionTypeSchema],
      additionalInfo: { type: String, default: "" },
      fileNames: [String],
      fileData: [
         {
            name: String,
            mimeType: String,
            data: String,
            _id: false,
         },
      ],
      status: {
         type: String,
         enum: ["pending", "processing", "completed", "failed"],
         default: "pending",
      },
      generatedPaper: generatedPaperSchema,
   },
   { timestamps: true },
);

export const Assignment = mongoose.model<IAssignment>(
   "Assignment",
   assignmentSchema,
);
