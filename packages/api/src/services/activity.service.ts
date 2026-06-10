import type {
  ActivitySettings,
  ExercisePrescription,
  PatientExerciseLogDraft,
  PatientExerciseLogReviewable,
} from "@pulso/shared";
import {
  MOCK_ACTIVITY_SETTINGS,
  MOCK_EXERCISE_PRESCRIPTIONS,
  createDemoExerciseLog,
} from "../mock-data/activity.mock.js";

/**
 * Servicio del módulo de actividad física opcional — MC-10.
 *
 * REGLA CRÍTICA (doble candado):
 *   - Las prescripciones son datos profesionales/validados.
 *   - Los registros del paciente son DATOS REVISABLES.
 *     origin: "patient_reported" / reviewStatus: "pending"
 *   - Nunca se valida automáticamente.
 *   - El módulo solo está activo si ActivitySettings.moduleStatus === "active".
 *
 * En MC-10 no hay persistencia — solo preview/simulación.
 */

export function getActivitySettings(patientId: string): ActivitySettings | null {
  return MOCK_ACTIVITY_SETTINGS[patientId] ?? null;
}

export function getExercisePrescriptions(
  patientId: string,
): ReadonlyArray<ExercisePrescription> | null {
  const settings = MOCK_ACTIVITY_SETTINGS[patientId];
  if (!settings) return null;

  return MOCK_EXERCISE_PRESCRIPTIONS[patientId] ?? [];
}

export function previewExerciseLog(
  patientId: string,
  draft: PatientExerciseLogDraft,
): PatientExerciseLogReviewable {
  const log = createDemoExerciseLog(patientId, {
    date: draft.date,
    activityType: draft.activityType,
    durationMinutes: draft.durationMinutes,
    intensity: draft.intensity,
    notes: draft.notes,
  });

  // SIEMPRE nace como dato revisable / pendiente — nunca ValidatedData
  return {
    data: log,
    origin: "patient_reported",
    reviewStatus: "pending",
  };
}
