import type { FastifyReply, FastifyRequest } from "fastify";
import type { NewConsultationDraft } from "@pulso/shared";
import {
  listConsultationsByPatient,
  getConsultationById,
  previewNewConsultation,
} from "../services/consultations.service.js";

/**
 * GET /patients/:patientId/consultations
 * Lista de consultas de un paciente.
 */
export async function listConsultationsController(
  request: FastifyRequest<{
    Params: { patientId: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const consultations = listConsultationsByPatient(request.params.patientId);
  await reply.code(200).send({ data: consultations, meta: { demo: true } });
}

/**
 * GET /patients/:patientId/consultations/:consultationId
 * Detalle de una consulta específica.
 */
export async function getConsultationController(
  request: FastifyRequest<{
    Params: { patientId: string; consultationId: string };
  }>,
  reply: FastifyReply,
): Promise<void> {
  const consultation = getConsultationById(
    request.params.patientId,
    request.params.consultationId,
  );

  if (consultation === null) {
    await reply.code(404).send({
      error: {
        code: "CONSULTATION_NOT_FOUND",
        message: `No existe consulta demo con id "${request.params.consultationId}"`,
        statusCode: 404,
      },
    });
    return;
  }

  await reply.code(200).send({ data: consultation, meta: { demo: true } });
}

/**
 * POST /patients/:patientId/consultations/preview
 * Preview de una nueva consulta (simulación sin persistencia).
 */
export async function previewConsultationController(
  request: FastifyRequest<{
    Params: { patientId: string };
    Body: NewConsultationDraft;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const consultation = previewNewConsultation(
    request.params.patientId,
    request.body,
  );

  await reply.code(200).send({
    data: {
      consultation,
    },
    meta: {
      demo: true,
      warning:
        "Esta es una simulación. Los datos no se guardan. MC-4 es puramente demostrativo.",
    },
  });
}
