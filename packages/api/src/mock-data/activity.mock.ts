/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN — MC-10.
 *
 * Configuración de actividad física y prescripciones profesionales.
 * Módulo OPCIONAL: solo activo para demo-1. demo-2 y demo-3 lo tienen inactivo.
 *
 * Doble candado:
 *   1. ActivitySettings determina si el módulo está activo para el paciente.
 *   2. ExercisePrescription es dato profesional/validado (origin: "professional_validated").
 *   3. Los registros del paciente nacen como ReviewableData (origin: "patient_reported", pending).
 *
 * No representan datos clínicos ni recomendaciones médicas reales.
 */

import type {
  ActivitySettings,
  ExercisePrescription,
  PatientExerciseLog,
  ExerciseLogId,
} from "@pulso/shared";

/** Configuración del módulo por paciente. */
export const MOCK_ACTIVITY_SETTINGS: Record<string, ActivitySettings> = {
  "demo-1": {
    patientId: "demo-1",
    moduleStatus: "active",
    activatedAt: "2026-05-01",
    isDemoData: true,
  },
  "demo-2": {
    patientId: "demo-2",
    moduleStatus: "inactive",
    isDemoData: true,
  },
  "demo-3": {
    patientId: "demo-3",
    moduleStatus: "inactive",
    isDemoData: true,
  },
};

/** Prescripciones profesionales por paciente (solo demo-1 tiene el módulo activo). */
export const MOCK_EXERCISE_PRESCRIPTIONS: Record<string, ReadonlyArray<ExercisePrescription>> = {
  "demo-1": [
    {
      id: "pres-act-demo-1-a",
      patientId: "demo-1",
      activityType: "walking",
      durationMinutes: 30,
      intensity: "low",
      frequency: "3 veces por semana",
      generalNotes:
        "Caminata liviana al aire libre. Preferentemente por la mañana. No se requiere equipamiento especial.",
      startDate: "2026-05-01",
      isDemoData: true,
    },
    {
      id: "pres-act-demo-1-b",
      patientId: "demo-1",
      activityType: "mobility",
      durationMinutes: 15,
      intensity: "low",
      frequency: "Todos los días",
      generalNotes:
        "Movilidad y elongación suave. Puede hacerse antes de dormir.",
      startDate: "2026-05-15",
      isDemoData: true,
    },
  ],
  "demo-2": [],
  "demo-3": [],
};

let exerciseLogCounter = 0;

export function generateExerciseLogId(): ExerciseLogId {
  return `exercise-log-demo-${++exerciseLogCounter}-${Date.now()}`;
}

export function createDemoExerciseLog(
  patientId: string,
  overrides?: Partial<PatientExerciseLog>,
): PatientExerciseLog {
  return {
    id: generateExerciseLogId(),
    patientId,
    date: new Date().toISOString().split("T")[0] ?? "",
    activityType: "walking",
    durationMinutes: 30,
    intensity: "low",
    notes: undefined,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
