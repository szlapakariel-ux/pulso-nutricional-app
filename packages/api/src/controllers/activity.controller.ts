import type { FastifyRequest, FastifyReply } from "fastify";
import type { PatientExerciseLogDraft } from "@pulso/shared";
import {
  getActivitySettings,
  getExercisePrescriptions,
  previewExerciseLog,
} from "../services/activity.service.js";

interface PatientIdParams {
  patientId: string;
}

interface ExerciseLogPreviewBody {
  date: string;
  activityType: string;
  durationMinutes: number;
  intensity: string;
  notes?: string;
}

/**
 * GET /patients/:patientId/activity/settings
 *
 * Devuelve si el módulo de actividad está activo para este paciente.
 * Si el paciente no existe, devuelve 404.
 */
export async function getActivitySettingsController(
  request: FastifyRequest<{ Params: PatientIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const settings = getActivitySettings(patientId);

  if (!settings) {
    await reply.code(404).send({ error: "Paciente no encontrado" });
    return;
  }

  await reply.send(settings);
}

/**
 * GET /patients/:patientId/activity/prescriptions
 *
 * Devuelve las prescripciones profesionales de actividad.
 * Si el módulo está inactivo, devuelve lista vacía con indicación.
 * Si el paciente no existe, devuelve 404.
 */
export async function getExercisePrescriptionsController(
  request: FastifyRequest<{ Params: PatientIdParams }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;
  const prescriptions = getExercisePrescriptions(patientId);

  if (prescriptions === null) {
    await reply.code(404).send({ error: "Paciente no encontrado" });
    return;
  }

  const settings = getActivitySettings(patientId);

  await reply.send({
    patientId,
    moduleStatus: settings?.moduleStatus ?? "inactive",
    prescriptions,
    meta: {
      demo: true,
      warning:
        "Prescripciones demo — MC-10. Datos ficticios. No representan recomendaciones médicas reales.",
    },
  });
}

/**
 * POST /patients/:patientId/activity-logs/preview
 *
 * Simula el registro de actividad del paciente.
 * Devuelve ReviewableData<PatientExerciseLog> con status "pending".
 *
 * Si el módulo está inactivo para el paciente → 403.
 * NO persiste datos en MC-10.
 */
export async function previewExerciseLogController(
  request: FastifyRequest<{
    Params: PatientIdParams;
    Body: ExerciseLogPreviewBody;
  }>,
  reply: FastifyReply,
): Promise<void> {
  const { patientId } = request.params;

  const settings = getActivitySettings(patientId);
  if (!settings) {
    await reply.code(404).send({ error: "Paciente no encontrado" });
    return;
  }

  if (settings.moduleStatus !== "active") {
    await reply.code(403).send({
      error: "Módulo de actividad no habilitado para este paciente demo.",
      moduleStatus: settings.moduleStatus,
    });
    return;
  }

  const draft: PatientExerciseLogDraft = {
    date: request.body.date,
    activityType: request.body.activityType as PatientExerciseLogDraft["activityType"],
    durationMinutes: request.body.durationMinutes,
    intensity: request.body.intensity as PatientExerciseLogDraft["intensity"],
    notes: request.body.notes,
  };

  const reviewable = previewExerciseLog(patientId, draft);

  await reply.send({
    data: reviewable,
    meta: {
      demo: true,
      warning:
        "Registro simulado — MC-10. No se persiste. Estado: pendiente de revisión profesional.",
    },
  });
}
