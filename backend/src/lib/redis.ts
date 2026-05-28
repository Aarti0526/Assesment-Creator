import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient>;

export function getRedisClient() {
   if (!redisClient) {
      const isSecure = process.env.REDIS_URL?.startsWith("rediss:");
      redisClient = createClient({
         url: process.env.REDIS_URL,
         socket: isSecure
            ? {
                 tls: true,
                 rejectUnauthorized: false,
              }
            : undefined,
      });
      redisClient.on("error", (err) => console.error("Redis error:", err));
   }
   return redisClient;
}

export async function connectRedis() {
   const client = getRedisClient();
   await client.connect();
   console.log("Redis connected");
}

// BullMQ connection config (parsed from REDIS_URL)
export function getBullMQConnection() {
   const url = new URL(process.env.REDIS_URL || "redis://localhost:6379");
   return {
      host: url.hostname,
      port: Number(url.port || 6379),
      password: url.password || undefined,
      tls: url.protocol === "rediss:" ? { rejectUnauthorized: false } : undefined,
   };
}
