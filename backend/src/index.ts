import dotenv from "dotenv";
dotenv.config();

import cors from "cors";
import express from "express";
import { createServer } from "http";

import { connectDB } from "./lib/db";
import { connectRedis } from "./lib/redis";
import assignmentRoutes from "./routes/assignment-routes";
import { setupSocket } from "./websocket/socket";
import { startGenerationWorker } from "./workers/generation-worker";

const app = express();
const httpServer = createServer(app);

// Middleware
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:2026")
   .split(",")
   .map((o) => o.trim());

app.use(
   cors({
      origin: allowedOrigins,
   }),
);
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/api/assignments", assignmentRoutes);

// Health check
app.get("/api/health", (_req, res) => {
   res.json({ status: "ok" });
});

async function start() {
   try {
      await connectDB();
      await connectRedis();

      const io = setupSocket(httpServer);
      startGenerationWorker(io);

      const port = process.env.PORT || 5001;
      httpServer.listen(port, () => {
         console.log(`Server running on port ${port}`);
      });

      // Increase timeout for large file uploads (5 minutes)
      httpServer.setTimeout(5 * 60 * 1000);
   } catch (error) {
      console.error("Failed to start server:", error);
      process.exit(1);
   }
}

start();
