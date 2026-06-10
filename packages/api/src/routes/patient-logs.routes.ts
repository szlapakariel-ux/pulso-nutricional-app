import type { FastifyInstance } from "fastify";
import {
  previewMealLogController,
  previewWeightLogController,
  previewNoteController,
} from "../controllers/patient-logs.controller.js";
import { requirePatientSelf } from "../middleware/auth-guards.js";

/**
 * Rutas de registros del paciente (datos revisables) — MC-7.
 *
 * Endpoints provisionales de preview simulado, sin persistencia.
 * Guard requirePatientSelf activo cuando PULSO_AUTH_ENFORCEMENT=demo (MC-10.5D).
 *
 * DATO REVISABLE — nacen todos con origin: "patient_reported" y
 * reviewStatus: "pending". Nunca se validan automáticamente.
 */
export async function patientLogsRoutes(app: FastifyInstance): Promise<void> {
  const patientIdSchema = {
    type: "object" as const,
    properties: { patientId: { type: "string" } },
    required: ["patientId"],
  };

  const mealLogPreviewSchema = {
    type: "object" as const,
    properties: {
      date: { type: "string" },
      timeOfDay: { type: "string" },
      foodDescription: { type: "string" },
      portion: { type: "string" },
      notes: { type: "string" },
    },
    required: ["date", "timeOfDay", "foodDescription"],
  };

  const weightLogPreviewSchema = {
    type: "object" as const,
    properties: {
      date: { type: "string" },
      weight: { type: "number" },
      notes: { type: "string" },
    },
    required: ["date", "weight"],
  };

  const notePreviewSchema = {
    type: "object" as const,
    properties: {
      type: { type: "string" },
      subject: { type: "string" },
      body: { type: "string" },
    },
    required: ["type", "subject", "body"],
  };

  // POST /patients/:patientId/meal-logs/preview
  app.post(
    "/patients/:patientId/meal-logs/preview",
    {
      preHandler: requirePatientSelf as any,
      schema: {
        params: patientIdSchema,
        body: mealLogPreviewSchema,
      },
    },
    previewMealLogController,
  );

  // POST /patients/:patientId/weight-logs/preview
  app.post(
    "/patients/:patientId/weight-logs/preview",
    {
      preHandler: requirePatientSelf as any,
      schema: {
        params: patientIdSchema,
        body: weightLogPreviewSchema,
      },
    },
    previewWeightLogController,
  );

  // POST /patients/:patientId/notes/preview
  app.post(
    "/patients/:patientId/notes/preview",
    {
      preHandler: requirePatientSelf as any,
      schema: {
        params: patientIdSchema,
        body: notePreviewSchema,
      },
    },
    previewNoteController,
  );
}
