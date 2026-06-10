import type { FastifyRequest, FastifyReply } from "fastify";
import type {
  PatientMealLogDraft,
  PatientWeightLogDraft,
  PatientNoteDraft,
} from "@pulso/shared";
import {
  previewMealLog,
  previewWeightLog,
  previewNote,
} from "../services/patient-logs.service.js";

interface PatientIdParams {
  patientId: string;
}

interface MealLogPreviewBody {
  date: string;
  timeOfDay:
    | "breakfast"
    | "mid_morning"
    | "lunch"
    | "afternoon"
    | "snack"
    | "dinner"
    | "night";
  foodDescription: string;
  portion?: string;
  notes?: string;
}

interface WeightLogPreviewBody {
  date: string;
  weight: number;
  notes?: string;
}

interface NotePreviewBody {
  type: "question" | "observation" | "concern";
  subject: string;
  body: string;
}

/**
 * POST /patients/:patientId/meal-logs/preview
 *
 * Simula carga de registro de comida.
 * Devuelve ReviewableData<PatientMealLog> con status "pending".
 * NO persiste datos en MC-7.
 */
export async function previewMealLogController(
  request: FastifyRequest<{
    Params: PatientIdParams;
    Body: MealLogPreviewBody;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const draft: PatientMealLogDraft = request.body;

  const reviewable = previewMealLog(patientId, draft);

  await reply.send({
    data: reviewable,
    meta: {
      demo: true,
      warning:
        "Registro simulado — MC-7. No se persiste. Estado: pendiente de revisión.",
    },
  });
}

/**
 * POST /patients/:patientId/weight-logs/preview
 *
 * Simula carga de registro de peso.
 * Devuelve ReviewableData<PatientWeightLog> con status "pending".
 * NO persiste datos en MC-7.
 */
export async function previewWeightLogController(
  request: FastifyRequest<{
    Params: PatientIdParams;
    Body: WeightLogPreviewBody;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const draft: PatientWeightLogDraft = request.body;

  const reviewable = previewWeightLog(patientId, draft);

  await reply.send({
    data: reviewable,
    meta: {
      demo: true,
      warning:
        "Registro simulado — MC-7. No se persiste. Estado: pendiente de revisión.",
    },
  });
}

/**
 * POST /patients/:patientId/notes/preview
 *
 * Simula envío de nota/pregunta.
 * Devuelve ReviewableData<PatientNote> con status "pending".
 * NO persiste datos en MC-7.
 */
export async function previewNoteController(
  request: FastifyRequest<{
    Params: PatientIdParams;
    Body: NotePreviewBody;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const draft: PatientNoteDraft = request.body;

  const reviewable = previewNote(patientId, draft);

  await reply.send({
    data: reviewable,
    meta: {
      demo: true,
      warning:
        "Nota simulada — MC-7. No se persiste. Estado: pendiente de revisión.",
    },
  });
}
