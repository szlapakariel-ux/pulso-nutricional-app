import type { FastifyInstance } from "fastify";
import {
  getActivitySettingsController,
  getExercisePrescriptionsController,
  previewExerciseLogController,
} from "../controllers/activity.controller.js";

export async function activityRoutes(app: FastifyInstance): Promise<void> {
  app.get("/patients/:patientId/activity/settings", getActivitySettingsController);
  app.get("/patients/:patientId/activity/prescriptions", getExercisePrescriptionsController);
  app.post("/patients/:patientId/activity-logs/preview", previewExerciseLogController);
}
