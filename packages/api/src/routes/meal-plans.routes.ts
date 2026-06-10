import type { FastifyInstance } from "fastify";
import {
  getPatientMealPlanController,
  getPatientAgendaController,
} from "../controllers/meal-plans.controller.js";
import { requireProfessional } from "../middleware/auth-guards.js";

/**
 * Rutas de planes y agenda — MC-5.
 *
 * Endpoints provisionales, read-only, datos mock ficticios.
 * Guard requireProfessional activo cuando PULSO_AUTH_ENFORCEMENT=demo (MC-10.5D).
 *
 * DATO PROFESIONAL / VALIDADO — no son ReviewableData.
 */
export async function mealPlansRoutes(app: FastifyInstance): Promise<void> {
  const patientIdSchema = {
    type: "object" as const,
    properties: { patientId: { type: "string" } },
    required: ["patientId"],
  };

  // GET /patients/:patientId/meal-plan
  app.get(
    "/patients/:patientId/meal-plan",
    { preHandler: requireProfessional as any, schema: { params: patientIdSchema } },
    getPatientMealPlanController,
  );

  // GET /patients/:patientId/agenda
  app.get(
    "/patients/:patientId/agenda",
    { preHandler: requireProfessional as any, schema: { params: patientIdSchema } },
    getPatientAgendaController,
  );
}
