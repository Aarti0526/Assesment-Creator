import { getRedisClient } from "../lib/redis";
import { Assignment } from "../models/assignment";
import { generationQueue } from "../queues/generation-queue";

export interface CreateAssignmentDto {
   dueDate?: string;
   additionalInfo?: string;
   questionTypes: any[];
   fileNames: string[];
   fileData: { name: string; mimeType: string; data: string }[];
}

export class AssignmentService {
   /**
    * Creates a new assignment entry in the database and adds a question generation job to BullMQ.
    */
   public async create(dto: CreateAssignmentDto) {
      // 1. Create assignment entry in MongoDB
      const assignment = await Assignment.create({
         dueDate: dto.dueDate,
         questionTypes: dto.questionTypes,
         additionalInfo: dto.additionalInfo || "",
         fileNames: dto.fileNames,
         fileData: dto.fileData,
         status: "pending",
      });

      // 2. Enqueue task for background worker execution
      await generationQueue.add(
         "generate",
         { assignmentId: assignment._id.toString() },
         { attempts: 3, backoff: { type: "exponential", delay: 3000 } },
      );

      return assignment;
   }

   /**
    * Fetches an assignment by ID. Utilizes Redis caching for completed assignments.
    */
   public async getById(id: string) {
      const redis = getRedisClient();
      
      // 1. Check local Redis cache
      const cached = await redis.get(`assignment:${id}`);
      if (cached) {
         return JSON.parse(cached);
      }

      // 2. Fetch from MongoDB
      const assignment = await Assignment.findById(id).select("-fileData");
      if (!assignment) {
         return null;
      }

      // 3. Cache completed assignments for 1 hour
      if (assignment.status === "completed") {
         await redis.set(
            `assignment:${id}`,
            JSON.stringify(assignment),
            { EX: 3600 },
         );
      }

      return assignment;
   }

   /**
    * Lists all assignments, excluding large fields like generatedPaper and fileData, sorted by creation date.
    */
   public async listAll() {
      return await Assignment.find()
         .select("-generatedPaper -fileData")
         .sort({ createdAt: -1 });
   }
}
