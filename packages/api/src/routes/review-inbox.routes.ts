import type { FastifyInstance } from "fastify";
import {
  getAllReviewInboxController,
  getPatientReviewInboxController,
  previewReviewActionController,
} from "../controllers/review-inbox.controller.js";
import { requireProfessional } from "../middleware/auth-guards.js";

/**
 * Rutas de bandeja de revisión profesional — MC-8.
 *
 * Endpoints provisionales, read-only + preview simulado, sin persistencia.
 * Guard requireProfessional activo cuando PULSO_AUTH_ENFORCEMENT=demo (MC-10.5D).
 * Las acciones de revisión cambian reviewStatus pero NO crean ValidatedData.
 */
export async function reviewInboxRoutes(app: FastifyInstance): Promise<void> {
  const patientIdSchema = {
    type: "object" as const,
    properties: { patientId: { type: "string" } },
    required: ["patientId"],
  };

  const entryIdSchema = {
    type: "object" as const,
    properties: { entryId: { type: "string" } },
    required: ["entryId"],
  };

  const reviewActionSchema = {
    type: "object" as const,
    properties: {
      actionType: { type: "string" },
      comment: { type: "string" },
      notes: { type: "string" },
    },
    required: ["actionType"],
  };

  // GET /professionals/demo/review-inbox
  app.get(
    "/professionals/demo/review-inbox",
    { preHandler: requireProfessional as any },
    getAllReviewInboxController,
  );

  // GET /patients/:patientId/review-inbox
  app.get(
    "/patients/:patientId/review-inbox",
    { preHandler: requireProfessional as any, schema: { params: patientIdSchema } },
    getPatientReviewInboxController,
  );

  // POST /review-inbox/:entryId/action/preview
  app.post(
    "/review-inbox/:entryId/action/preview",
    {
      preHandler: requireProfessional as any,
      schema: {
        params: entryIdSchema,
        body: reviewActionSchema,
      },
    },
    previewReviewActionController,
  );
}
