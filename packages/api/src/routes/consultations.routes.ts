import type { FastifyInstance } from "fastify";
import {
  listConsultationsController,
  getConsultationController,
  previewConsultationController,
} from "../controllers/consultations.controller.js";

/**
 * Rutas de consultas — MC-4.
 *
 * Endpoints provisionales, read-only + preview simulado.
 * Datos mock ficticios. No usan base de datos, Prisma, Railway ni autenticación.
 */
export async function consultationsRoutes(
  app: FastifyInstance,
): Promise<void> {
  // GET /patients/:patientId/consultations
  app.get(
    "/patients/:patientId/consultations",
    {
      schema: {
        params: {
          type: "object",
          properties: { patientId: { type: "string" } },
          required: ["patientId"],
        },
      },
    },
    listConsultationsController,
  );

  // GET /patients/:patientId/consultations/:consultationId
  app.get(
    "/patients/:patientId/consultations/:consultationId",
    {
      schema: {
        params: {
          type: "object",
          properties: {
            patientId: { type: "string" },
            consultationId: { type: "string" },
          },
          required: ["patientId", "consultationId"],
        },
      },
    },
    getConsultationController,
  );

  // POST /patients/:patientId/consultations/preview
  app.post(
    "/patients/:patientId/consultations/preview",
    {
      schema: {
        params: {
          type: "object",
          properties: { patientId: { type: "string" } },
          required: ["patientId"],
        },
        body: {
          type: "object",
          properties: {
            date: { type: "string" },
            reason: { type: "string" },
            objective: { type: "string" },
            observations: { type: "string" },
            professionalNote: { type: "string" },
            measurements: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  value: { type: "number" },
                  unit: { type: "string" },
                  notes: { type: "string" },
                },
                required: ["type", "value", "unit"],
              },
            },
          },
          required: [
            "date",
            "reason",
            "objective",
            "observations",
            "professionalNote",
            "measurements",
          ],
        },
      },
    },
    previewConsultationController,
  );
}
