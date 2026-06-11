import type {
  PatientMealLogDraft,
  PatientWeightLogDraft,
  PatientNoteDraft,
  PatientMealLogReviewable,
  PatientWeightLogReviewable,
  PatientNoteReviewable,
  ReviewInboxItem,
} from "@pulso/shared";
import {
  createDemoMealLog,
  createDemoWeightLog,
  createDemoNote,
} from "../mock-data/patient-logs.mock.js";
import { addEntryToReviewInbox } from "./review-inbox.service.js";
import { MOCK_PATIENTS } from "../mock-data/patients.mock.js";

/**
 * Servicio de registros del paciente — MC-7 / MC-INTEGRACION-1.
 *
 * REGLA CRÍTICA: todos los registros nacen como DATO REVISABLE.
 *   - origin: "patient_reported"
 *   - reviewStatus: "pending"
 *   - Nunca como ValidatedData
 *   - Nunca validados automáticamente
 *
 * PERSISTENCIA: las funciones create* agregan el registro al inbox EN MEMORIA
 * del proceso (demo) — NO es persistencia real en base de datos. El contenido
 * se pierde al reiniciar el proceso y no usa Prisma/Postgres. La persistencia
 * real queda para un microciclo posterior.
 * Las funciones preview* son alias sin side-effects (MC-7 compat).
 */

function getPatientName(patientId: string): string {
  const p = MOCK_PATIENTS.find((pt) => pt.id === patientId);
  return p?.fullName ?? `Paciente ${patientId}`;
}

export function createMealLog(
  patientId: string,
  draft: PatientMealLogDraft,
): PatientMealLogReviewable {
  const mealLog = createDemoMealLog(patientId, {
    date: draft.date,
    timeOfDay: draft.timeOfDay,
    foodDescription: draft.foodDescription,
    portion: draft.portion,
    notes: draft.notes,
  });

  const reviewable: PatientMealLogReviewable = {
    data: mealLog,
    origin: "patient_reported",
    reviewStatus: "pending",
  };

  const inboxEntry: ReviewInboxItem = {
    id: `inbox-${mealLog.id}`,
    patientId,
    patientName: getPatientName(patientId),
    entryType: "meal_log",
    entry: reviewable,
    createdAt: mealLog.createdAt,
    reviewStatus: "pending",
    isDemoData: true,
  };

  addEntryToReviewInbox(inboxEntry);
  return reviewable;
}

export function createWeightLog(
  patientId: string,
  draft: PatientWeightLogDraft,
): PatientWeightLogReviewable {
  const weightLog = createDemoWeightLog(patientId, {
    date: draft.date,
    weight: draft.weight,
    notes: draft.notes,
  });

  const reviewable: PatientWeightLogReviewable = {
    data: weightLog,
    origin: "patient_reported",
    reviewStatus: "pending",
  };

  const inboxEntry: ReviewInboxItem = {
    id: `inbox-${weightLog.id}`,
    patientId,
    patientName: getPatientName(patientId),
    entryType: "weight_log",
    entry: reviewable,
    createdAt: weightLog.createdAt,
    reviewStatus: "pending",
    isDemoData: true,
  };

  addEntryToReviewInbox(inboxEntry);
  return reviewable;
}

export function createNote(
  patientId: string,
  draft: PatientNoteDraft,
): PatientNoteReviewable {
  const note = createDemoNote(patientId, {
    type: draft.type,
    subject: draft.subject,
    body: draft.body,
  });

  const reviewable: PatientNoteReviewable = {
    data: note,
    origin: "patient_reported",
    reviewStatus: "pending",
  };

  const inboxEntry: ReviewInboxItem = {
    id: `inbox-${note.id}`,
    patientId,
    patientName: getPatientName(patientId),
    entryType: "note",
    entry: reviewable,
    createdAt: note.createdAt,
    reviewStatus: "pending",
    isDemoData: true,
  };

  addEntryToReviewInbox(inboxEntry);
  return reviewable;
}

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
