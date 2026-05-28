import { Queue } from "bullmq";

import { getBullMQConnection } from "../lib/redis";

export const generationQueue = new Queue("question-generation", {
   connection: getBullMQConnection(),
});
