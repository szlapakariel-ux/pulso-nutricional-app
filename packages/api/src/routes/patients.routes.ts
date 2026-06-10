import type { FastifyInstance } from "fastify";
import {
  getPatientController,
  listPatientsController,
} from "../controllers/patients.controller.js";
import {
  requireProfessional,
} from "../middleware/auth-guards.js";

/**
 * Rutas de pacientes — MC-3.
 *
 * Endpoints provisionales, read-only y con datos mock ficticios.
 * Guard requireProfessional activo cuando PULSO_AUTH_ENFORCEMENT=demo (MC-10.5D).
 */
export async function patientsRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients",
    { preHandler: requireProfessional as any },
    listPatientsController,
  );

  app.get(
    "/patients/:id",
    {
      preHandler: requireProfessional as any,
      schema: {
        params: {
          type: "object",
          properties: { id: { type: "string" } },
          required: ["id"],
        },
      },
    },
    getPatientController,
  );
}
