import type {
  PatientMealLogDraft,
  PatientWeightLogDraft,
  PatientNoteDraft,
  PatientMealLogReviewable,
  PatientWeightLogReviewable,
  PatientNoteReviewable,
} from "@pulso/shared";
import {
  createDemoMealLog,
  createDemoWeightLog,
  createDemoNote,
} from "../mock-data/patient-logs.mock.js";

/**
 * Servicio de registros del paciente — MC-7.
 *
 * REGLA CRÍTICA: todos los registros nacen como DATO REVISABLE.
 *   - origin: "patient_reported"
 *   - reviewStatus: "pending"
 *   - Nunca como ValidatedData
 *   - Nunca validados automáticamente
 *
 * En MC-7 no hay persistencia — solo preview/simulación.
 */

export function previewMealLog(
  patientId: string,
  draft: PatientMealLogDraft,
): PatientMealLogReviewable {
  // Crear registro base desde el draft
  const mealLog = createDemoMealLog(patientId, {
    date: draft.date,
    timeOfDay: draft.timeOfDay,
    foodDescription: draft.foodDescription,
    portion: draft.portion,
    notes: draft.notes,
  });

  // Envolver en ReviewableData — SIEMPRE nace como pending
  return {
    data: mealLog,
    origin: "patient_reported",
    reviewStatus: "pending",
  };
}

export function previewWeightLog(
  patientId: string,
  draft: PatientWeightLogDraft,
): PatientWeightLogReviewable {
  const weightLog = createDemoWeightLog(patientId, {
    date: draft.date,
    weight: draft.weight,
    notes: draft.notes,
  });

  return {
    data: weightLog,
    origin: "patient_reported",
    reviewStatus: "pending",
  };
}

export function previewNote(
  patientId: string,
  draft: PatientNoteDraft,
): PatientNoteReviewable {
  const note = createDemoNote(patientId, {
    type: draft.type,
    subject: draft.subject,
    body: draft.body,
  });

  return {
    data: note,
    origin: "patient_reported",
    reviewStatus: "pending",
  };
}
