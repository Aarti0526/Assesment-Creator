"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001";

interface AssignmentUpdate {
   status: "processing" | "completed" | "failed";
   message: string;
}

export function useAssignmentSocket(assignmentId: string | null) {
   const socketRef = useRef<Socket | null>(null);
   const [status, setStatus] = useState<AssignmentUpdate | null>(null);

   useEffect(() => {
      if (!assignmentId) return;

      const socket = io(SOCKET_URL, { transports: ["websocket"] });
      socketRef.current = socket;

      socket.on(`assignment:${assignmentId}`, (data: AssignmentUpdate) => {
         setStatus(data);
      });

      return () => {
         socket.disconnect();
         socketRef.current = null;
      };
   }, [assignmentId]);

   return status;
}
