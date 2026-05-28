import type { Request, Response } from "express";
import type { AssignmentService } from "../services/assignment-service";

export class AssignmentController {
   private assignmentService: AssignmentService;

   constructor(assignmentService: AssignmentService) {
      this.assignmentService = assignmentService;
   }

   /**
    * Endpoint: POST /api/assignments
    */
   public create = async (req: Request, res: Response): Promise<void> => {
      try {
         const { dueDate, additionalInfo } = req.body;

         // Parse questionTypes from form data (sent as JSON string)
         let questionTypes;
         try {
            questionTypes =
               typeof req.body.questionTypes === "string"
                  ? JSON.parse(req.body.questionTypes)
                  : req.body.questionTypes;
         } catch {
            res.status(400).json({ error: "Invalid questionTypes format" });
            return;
         }

         // Convert uploaded files to base64 for storage
         const files = (req.files as Express.Multer.File[]) || [];
         const fileNames = files.map((f) => f.originalname);
         const fileData = files.map((f) => ({
            name: f.originalname,
            mimeType: f.mimetype,
            data: f.buffer.toString("base64"),
         }));

         // Validation
         if (!questionTypes || questionTypes.length === 0) {
            res.status(400).json({ error: "At least one question type is required" });
            return;
         }

         for (const qt of questionTypes) {
            if (!qt.type || qt.numberOfQuestions < 1 || qt.marks < 1) {
               res.status(400).json({
                  error: "Invalid question type: type, numberOfQuestions, and marks are required",
               });
               return;
            }
         }

         // Delegate creation & enqueuing to AssignmentService
         const assignment = await this.assignmentService.create({
            dueDate,
            additionalInfo,
            questionTypes,
            fileNames,
            fileData,
         });

         res.status(201).json({
            id: assignment._id,
            status: assignment.status,
            message: "Assignment created. Generation started.",
         });
      } catch (error) {
         console.error("Create assignment controller error:", error);
         res.status(500).json({ error: "Failed to create assignment" });
      }
   };

   /**
    * Endpoint: GET /api/assignments/:id
    */
   public get = async (req: Request, res: Response): Promise<void> => {
      try {
         const { id } = req.params;

         // Retrieve assignment using AssignmentService
         const assignment = await this.assignmentService.getById(id as string);
         if (!assignment) {
            res.status(404).json({ error: "Assignment not found" });
            return;
         }

         res.json(assignment);
      } catch (error) {
         console.error("Get assignment controller error:", error);
         res.status(500).json({ error: "Failed to fetch assignment" });
      }
   };

   /**
    * Endpoint: GET /api/assignments
    */
   public list = async (_req: Request, res: Response): Promise<void> => {
      try {
         // Retrieve all assignments using AssignmentService
         const assignments = await this.assignmentService.listAll();
         res.json(assignments);
      } catch (error) {
         console.error("List assignments controller error:", error);
         res.status(500).json({ error: "Failed to list assignments" });
      }
   };
}
