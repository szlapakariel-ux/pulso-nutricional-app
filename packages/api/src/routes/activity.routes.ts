import type { FastifyInstance } from "fastify";
import {
  getActivitySettingsController,
  getExercisePrescriptionsController,
  previewExerciseLogController,
} from "../controllers/activity.controller.js";
import {
  requireProfessional,
  requirePatientSelf,
} from "../middleware/auth-guards.js";

/**
 * Rutas del módulo de actividad física — MC-10.
 * Guards activos cuando PULSO_AUTH_ENFORCEMENT=demo (MC-10.5D).
 * settings y prescriptions: solo profesional.
 * activity-logs/preview: paciente propio (o profesional).
 */
export async function activityRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients/:patientId/activity/settings",
    { preHandler: requireProfessional as any },
    getActivitySettingsController,
  );
  app.get(
    "/patients/:patientId/activity/prescriptions",
    { preHandler: requireProfessional as any },
    getExercisePrescriptionsController,
  );
  app.post(
    "/patients/:patientId/activity-logs/preview",
    { preHandler: requirePatientSelf as any },
    previewExerciseLogController,
  );
}
