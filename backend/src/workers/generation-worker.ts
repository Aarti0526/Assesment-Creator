import type { Part } from "@google/generative-ai";
import { Worker } from "bullmq";
import type { Server as SocketServer } from "socket.io";

import { geminiService } from "../lib/gemini";
import { getBullMQConnection } from "../lib/redis";
import {
   Assignment,
   type IFileData,
   type IQuestionType,
} from "../models/assignment";

function buildPrompt(
   questionTypes: IQuestionType[],
   additionalInfo: string,
): string {
   const totalQuestions = questionTypes.reduce(
      (sum, qt) => sum + qt.numberOfQuestions,
      0,
   );
   const totalMarks = questionTypes.reduce(
      (sum, qt) => sum + qt.numberOfQuestions * qt.marks,
      0,
   );

   const questionBreakdown = questionTypes
      .map(
         (qt) =>
            `- ${qt.type}: ${qt.numberOfQuestions} questions, ${qt.marks} marks each`,
      )
      .join("\n");

   return `You are an expert exam paper generator. Generate a structured question paper based on the uploaded reference material (images/PDFs) and the following specifications:

Total Questions: ${totalQuestions}
Total Marks: ${totalMarks}

Question Breakdown:
${questionBreakdown}

${additionalInfo ? `Additional Instructions: ${additionalInfo}` : ""}

IMPORTANT: Use the uploaded files as the primary source material. Generate questions that are directly based on the content shown in those files (textbook pages, syllabus, notes, etc). If no files are provided, generate general questions based on the question types.

IMPORTANT: For Multiple Choice Questions, include an "options" array with 4 options (a, b, c, d). For True/False questions, include an "options" array with ["True", "False"]. For all other question types, omit the "options" field.

IMPORTANT: Respond ONLY with valid JSON in the following format (no markdown, no code blocks, just raw JSON):
{
   "schoolName": "Mauni International School",
   "subject": "Science",
   "className": "8th",
   "timeAllowed": "45 minutes",
   "maximumMarks": ${totalMarks},
   "generalInstruction": "All questions are compulsory unless stated otherwise.",
   "sections": [
      {
         "title": "Section A",
         "instruction": "Attempt all questions. Each question carries X marks.",
         "questions": [
            {
               "questionNumber": 1,
               "text": "The question text here",
               "difficulty": "Easy",
               "marks": 2,
               "options": ["a) Option A", "b) Option B", "c) Option C", "d) Option D"]
            }
         ]
      }
   ],
   "answerKey": [
      {
         "questionNumber": 1,
         "answer": "Brief answer or explanation"
      }
   ]
}

Group questions into sections logically based on question types. Assign difficulty levels (Easy, Moderate, Hard) appropriately. Make questions relevant to a school-level exam.`;
}

function buildFileParts(fileData: IFileData[]): Part[] {
   return fileData.map((f) => ({
      inlineData: {
         mimeType: f.mimeType,
         data: f.data,
      },
   }));
}

export function startGenerationWorker(io: SocketServer) {
   const worker = new Worker(
      "question-generation",
      async (job) => {
         const { assignmentId } = job.data;

         try {
            // Update status to processing
            await Assignment.findByIdAndUpdate(assignmentId, {
               status: "processing",
            });
            io.emit(`assignment:${assignmentId}`, {
               status: "processing",
               message: "Generating questions...",
            });

            const assignment = await Assignment.findById(assignmentId);
            if (!assignment) throw new Error("Assignment not found");

            // Build prompt and file parts
            const prompt = buildPrompt(
               assignment.questionTypes,
               assignment.additionalInfo,
            );

            const fileParts = buildFileParts(assignment.fileData || []);

            // Call Gemini with multimodal content (files + text)
            const result = await geminiService.generate([
               ...fileParts,
               { text: prompt },
            ]);
            const responseText = result.response.text();

            // Parse the JSON response
            const cleanedResponse = responseText
               .replace(/```json\n?/g, "")
               .replace(/```\n?/g, "")
               .trim();

            const generatedPaper = JSON.parse(cleanedResponse);

            // Update assignment with generated paper
            await Assignment.findByIdAndUpdate(assignmentId, {
               status: "completed",
               generatedPaper,
            });

            io.emit(`assignment:${assignmentId}`, {
               status: "completed",
               message: "Question paper generated successfully!",
            });
         } catch (error) {
            console.error("Generation failed:", error);

            await Assignment.findByIdAndUpdate(assignmentId, {
               status: "failed",
            });

            io.emit(`assignment:${assignmentId}`, {
               status: "failed",
               message: "Failed to generate question paper.",
            });
         }
      },
      {
         connection: getBullMQConnection(),
         limiter: { max: 2, duration: 1000 },
      },
   );

   worker.on("completed", (job) => {
      console.log(`Job ${job.id} completed`);
   });

   worker.on("failed", (job, err) => {
      console.error(`Job ${job?.id} failed:`, err.message);
   });

   return worker;
}
