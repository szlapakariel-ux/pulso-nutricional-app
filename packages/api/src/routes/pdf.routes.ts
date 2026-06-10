import type { FastifyInstance } from "fastify";
import {
  getPdfPreviewMetadataController,
  downloadPlanPdfController,
} from "../controllers/pdf.controller.js";
import { requireProfessional } from "../middleware/auth-guards.js";

/**
 * Rutas de PDF profesional — MC-9.
 * Guard requireProfessional activo cuando PULSO_AUTH_ENFORCEMENT=demo (MC-10.5D).
 */
export async function pdfRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients/:patientId/pdf/plan/preview",
    { preHandler: requireProfessional as any },
    getPdfPreviewMetadataController,
  );

  app.get(
    "/patients/:patientId/pdf/plan/download",
    { preHandler: requireProfessional as any },
    downloadPlanPdfController,
  );
}
