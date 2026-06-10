import type { FastifyRequest, FastifyReply } from "fastify";
import type { ReviewActionDraft } from "@pulso/shared";
import {
  getReviewInbox,
  getAllReviewInbox,
  previewReviewAction,
} from "../services/review-inbox.service.js";

interface PatientIdParams {
  patientId: string;
}

interface EntryIdParams {
  entryId: string;
}

interface ReviewActionBody {
  actionType: "mark_reviewed" | "accept" | "flag" | "comment";
  comment?: string;
  notes?: string;
}

/**
 * GET /professionals/demo/review-inbox
 *
 * Devuelve la bandeja completa del profesional: todos los registros
 * pendientes de todos los pacientes.
 */
export async function getAllReviewInboxController(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const inbox = getAllReviewInbox();

  await reply.send({
    data: inbox,
    meta: {
      demo: true,
      warning:
        "Bandeja simulada — MC-8. Registros del paciente (ReviewableData) con diferentes estados de revisión. No hay persistencia real.",
    },
  });
}

/**
 * GET /patients/:patientId/review-inbox
 *
 * Devuelve registros pendientes de un paciente específico.
 */
export async function getPatientReviewInboxController(
  request: FastifyRequest<{ Params: PatientIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;

  const inbox = getReviewInbox(patientId);

  await reply.send({
    data: inbox,
    meta: {
      demo: true,
      warning:
        "Bandeja simulada — MC-8. No hay persistencia real. Registros siguen siendo ReviewableData.",
    },
  });
}

/**
 * POST /review-inbox/:entryId/action/preview
 *
 * Simula una acción de revisión (mark_reviewed, accept, flag, comment).
 * Devuelve un preview del resultado, sin persistencia.
 *
 * CRÍTICO: el registro SIGUE siendo ReviewableData incluso después de
 * la acción — nunca se convierte en ValidatedData.
 */
export async function previewReviewActionController(
  request: FastifyRequest<{
    Params: EntryIdParams;
    Body: ReviewActionBody;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { entryId } = request.params;
  const { actionType, comment } = request.body;

  const draft: ReviewActionDraft = {
    actionType,
    entryId,
    comment,
  };

  const result = previewReviewAction(entryId, draft);

  if (!result) {
    await reply.status(404).send({
      error: "Not Found",
      message: `Registro ${entryId} no encontrado en la bandeja`,
    });
    return;
  }

  await reply.send({
    data: result,
    meta: {
      demo: true,
      warning:
        "Acción simulada — MC-8. El registro sigue siendo ReviewableData, nunca ValidatedData. No hay persistencia.",
    },
  });
}
