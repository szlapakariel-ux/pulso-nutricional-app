import type { FastifyInstance } from "fastify";
import {
  getPdfPreviewMetadataController,
  downloadPlanPdfController,
} from "../controllers/pdf.controller.js";

export async function pdfRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    "/patients/:patientId/pdf/plan/preview",
    getPdfPreviewMetadataController,
  );

  app.get(
    "/patients/:patientId/pdf/plan/download",
    downloadPlanPdfController,
  );
}
