import type { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";

export function setupSocket(httpServer: HttpServer): SocketServer {
   const io = new SocketServer(httpServer, {
      cors: {
         origin: (process.env.CORS_ORIGIN || "http://localhost:2026")
            .split(",")
            .map((o) => o.trim()),
         methods: ["GET", "POST"],
      },
   });

   io.on("connection", (socket) => {
      console.log("Client connected:", socket.id);

      socket.on("disconnect", () => {
         console.log("Client disconnected:", socket.id);
      });
   });

   return io;
}
