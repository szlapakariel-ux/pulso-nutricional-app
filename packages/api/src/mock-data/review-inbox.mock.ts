/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN — MC-8.
 *
 * Bandeja de revisión profesional.
 * Contiene registros del paciente con diferentes estados de revisión.
 *
 * Todos son datos REVISABLES (ReviewableData) — nunca ValidatedData.
 * En MC-8 no se persisten — son solo para preview/simulación.
 */

import type {
  ReviewInboxItem,
  PatientMealLog,
  PatientWeightLog,
  PatientNote,
  MealLogId,
  WeightLogId,
  PatientNoteId,
} from "@pulso/shared";
import { createDemoMealLog, createDemoWeightLog, createDemoNote } from "./patient-logs.mock.js";

/**
 * Ejemplo de IDs que se generaron en MC-7 preview.
 * En producción serían UUIDs o IDs de DB.
 */
function createDemoMealLogId(): MealLogId {
  return `meal-log-inbox-${Date.now()}`;
}

function createDemoWeightLogId(): WeightLogId {
  return `weight-log-inbox-${Date.now()}`;
}

function createDemoNoteId(): PatientNoteId {
  return `note-inbox-${Date.now()}`;
}

/**
 * Inbox del profesional: registros del paciente demo-1 en varios estados.
 */
export function getReviewInboxForPatient(
  patientId: string,
): ReviewInboxItem[] {
  if (patientId === "demo-1") {
    const mealLog: PatientMealLog = createDemoMealLog(patientId, {
      id: createDemoMealLogId(),
      foodDescription: "Desayuno: café, tostadas integrales, mermelada",
      portion: "Una taza de café, dos tostadas medianas",
      notes: "Desayuno normal sin complicaciones",
    });

    const weightLog: PatientWeightLog = createDemoWeightLog(patientId, {
      id: createDemoWeightLogId(),
      weight: 72.3,
      notes: "Medida de la mañana",
    });

    const note: PatientNote = createDemoNote(patientId, {
      id: createDemoNoteId(),
      type: "question",
      subject: "Dudas sobre los horarios del plan",
      body: "¿Puedo cambiar la hora del almuerzo porque trabajo hasta tarde algunos días?",
    });

    return [
      {
        id: `inbox-${mealLog.id}`,
        patientId,
        patientName: "Paciente Demo Uno",
        entryType: "meal_log",
        entry: {
          data: mealLog,
          origin: "patient_reported",
          reviewStatus: "pending",
        },
        createdAt: mealLog.createdAt,
        reviewStatus: "pending",
        isDemoData: true,
      },
      {
        id: `inbox-${weightLog.id}`,
        patientId,
        patientName: "Paciente Demo Uno",
        entryType: "weight_log",
        entry: {
          data: weightLog,
          origin: "patient_reported",
          reviewStatus: "reviewed",
        },
        createdAt: weightLog.createdAt,
        reviewStatus: "reviewed",
        lastActionBy: "prof-demo-1",
        lastActionAt: new Date(Date.now() - 3600000).toISOString(),
        isDemoData: true,
      },
      {
        id: `inbox-${note.id}`,
        patientId,
        patientName: "Paciente Demo Uno",
        entryType: "note",
        entry: {
          data: note,
          origin: "patient_reported",
          reviewStatus: "pending",
        },
        createdAt: note.createdAt,
        reviewStatus: "pending",
        isDemoData: true,
      },
    ];
  }

  if (patientId === "demo-2") {
    const weightLog: PatientWeightLog = createDemoWeightLog(patientId, {
      id: createDemoWeightLogId(),
      weight: 68.7,
      notes: "Peso de control semanal",
    });

    return [
      {
        id: `inbox-${weightLog.id}`,
        patientId,
        patientName: "Paciente Demo Dos",
        entryType: "weight_log",
        entry: {
          data: weightLog,
          origin: "patient_reported",
          reviewStatus: "pending",
        },
        createdAt: weightLog.createdAt,
        reviewStatus: "pending",
        isDemoData: true,
      },
    ];
  }

  // demo-3 no tiene registros
  return [];
}

/**
 * Inbox global del profesional: todos los registros pendientes de todos los pacientes.
 */
export function getFullReviewInbox(): ReviewInboxItem[] {
  const demo1 = getReviewInboxForPatient("demo-1");
  const demo2 = getReviewInboxForPatient("demo-2");
  return [...demo1, ...demo2].filter((item) => item.reviewStatus === "pending");
}

/**
 * Simula una acción de revisión: cambia el reviewStatus.
 * Devuelve el registro actualizado (pero sigue siendo ReviewableData).
 */
export function applyReviewAction(
  inbox: ReviewInboxItem[],
  entryId: string,
  newStatus: "reviewed" | "accepted" | "flagged",
  comment?: string,
): ReviewInboxItem | null {
  const item = inbox.find((i) => i.id === entryId);
  if (!item) return null;

  return {
    ...item,
    reviewStatus: newStatus,
    lastActionBy: "prof-demo-1",
    lastActionAt: new Date().toISOString(),
    comment: comment || item.comment,
    // CRÍTICO: el entry SIGUE siendo ReviewableData — nunca se convierte en ValidatedData
    entry: {
      ...item.entry,
      reviewStatus: newStatus,
    },
  };
}
