import type { FastifyRequest, FastifyReply } from "fastify";
import {
  buildPatientPlanPdfData,
  generatePlanPdf,
  getPdfPreviewMetadata,
} from "../services/pdf.service.js";

interface PatientIdParams {
  patientId: string;
}

export async function getPdfPreviewMetadataController(
  request: FastifyRequest<{ Params: PatientIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const data = buildPatientPlanPdfData(patientId);

  if (!data) {
    await reply.code(404).send({ error: "Paciente no encontrado o sin plan asignado" });
    return;
  }

  const metadata = getPdfPreviewMetadata(patientId);
  await reply.send(metadata);
}

export async function downloadPlanPdfController(
  request: FastifyRequest<{ Params: PatientIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const data = buildPatientPlanPdfData(patientId);

  if (!data) {
    await reply.code(404).send({ error: "Paciente no encontrado o sin plan asignado" });
    return;
  }

  const buffer = await generatePlanPdf(data);

  await reply
    .header("Content-Type", "application/pdf")
    .header(
      "Content-Disposition",
      `attachment; filename="plan-${patientId}-demo.pdf"`,
    )
    .send(buffer);
}
