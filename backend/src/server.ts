import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import errorHandler from "./middleware/errorHandler.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import authRoutes from "./routes/auth.routes.js";
import classroomsRoutes from "./routes/classrooms.routes.js";
import sessionsRoutes from "./routes/sessions.routes.js";
import usersRoutes from "./routes/users.routes.js";

const app = express();
const api = express.Router();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok", service: "classroomlite-api", environment: env.nodeEnv });
});

api.use("/auth", authRoutes);
api.use("/users", usersRoutes);
api.use("/classrooms", classroomsRoutes);
api.use("/sessions", sessionsRoutes);
api.use("/attendance", attendanceRoutes);
app.use("/api/v1", api);

app.use((_request, response) => {
  response.status(404).json({ error: { message: "Route not found" } });
});
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`ClassroomLite API listening on port ${env.port}`);
});
