import type { FastifyRequest, FastifyReply } from "fastify";
import { getPatientTodayView } from "../services/patient-today.service.js";

interface PatientIdParams {
  patientId: string;
}

/**
 * GET /patients/:patientId/today
 *
 * Devuelve la vista "Hoy" del paciente: plan visible + agenda del día.
 * NUNCA incluye professionalNote ni notas internas.
 */
export async function getPatientTodayController(
  request: FastifyRequest<{ Params: PatientIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const today = new Date().toISOString().split("T")[0] ?? "";

  const view = getPatientTodayView(patientId, today);

  if (!view) {
    await reply.status(404).send({
      error: "Not Found",
      message: `Paciente ${patientId} no encontrado`,
    });
    return;
  }

  await reply.send({
    data: view,
    meta: {
      demo: true,
      warning:
        "Datos ficticios de demostración — MC-6. No representan información clínica real.",
    },
  });
}
