import type { FastifyInstance } from "fastify";
import {
  getPatientMealPlanController,
  getPatientAgendaController,
} from "../controllers/meal-plans.controller.js";

/**
 * Rutas de planes y agenda — MC-5.
 *
 * Endpoints provisionales, read-only, datos mock ficticios.
 * No usan base de datos, Prisma, Railway ni autenticación.
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
    { schema: { params: patientIdSchema } },
    getPatientMealPlanController,
  );

  // GET /patients/:patientId/agenda
  app.get(
    "/patients/:patientId/agenda",
    { schema: { params: patientIdSchema } },
    getPatientAgendaController,
  );
}
