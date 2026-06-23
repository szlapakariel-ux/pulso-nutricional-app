import type { FastifyInstance } from "fastify";
import {
  getPatientController,
  listPatientsController,
  createPatientController,
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

  // POST /patients — registrar nuevo paciente (sin cuenta)
  app.post(
    "/patients",
    {
      preHandler: requireProfessional as any,
      schema: {
        body: {
          type: "object",
          properties: {
            fullName: { type: "string", minLength: 1, maxLength: 200 },
            age: { type: "number", minimum: 1, maximum: 120 },
            goal: { type: "string", maxLength: 500 },
          },
          required: ["fullName"],
        },
      },
    },
    createPatientController,
  );
}
