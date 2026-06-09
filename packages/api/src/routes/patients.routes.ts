import type { FastifyInstance } from "fastify";
import {
  getPatientController,
  listPatientsController,
} from "../controllers/patients.controller.js";

/**
 * Rutas de pacientes — MC-3.
 *
 * Endpoints provisionales, read-only y con datos mock ficticios.
 * No usan base de datos, Prisma, Railway ni autenticación.
 */
export async function patientsRoutes(app: FastifyInstance): Promise<void> {
  app.get("/patients", listPatientsController);

  app.get(
    "/patients/:id",
    {
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
