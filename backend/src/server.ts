import { createServer } from "node:http";
import { app, attachSocketServer } from "./app.js";
import { config } from "./config.js";
import { db } from "./db.js";

const server = createServer(app);
const io = attachSocketServer(server);

server.listen(config.PORT, () => {
  console.log(`ClassroomLite API listening on port ${config.PORT}`);
});

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down`);
  io.close();
  server.close(async () => {
    await db.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
