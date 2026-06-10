import type { FastifyInstance } from "fastify";
import { getPatientTodayController } from "../controllers/patient-today.controller.js";

/**
 * Ruta vista "Hoy" del paciente — MC-6.
 *
 * Endpoint provisional, read-only, datos mock ficticios.
 * NUNCA expone professionalNote ni notas internas.
 */
export async function patientTodayRoutes(app: FastifyInstance): Promise<void> {
  const patientIdSchema = {
    type: "object" as const,
    properties: { patientId: { type: "string" } },
    required: ["patientId"],
  };

  // GET /patients/:patientId/today
  app.get(
    "/patients/:patientId/today",
    { schema: { params: patientIdSchema } },
    getPatientTodayController,
  );
}
