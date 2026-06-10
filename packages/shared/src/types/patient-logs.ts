/**
 * Tipos de registros del paciente (datos revisables) — MC-7.
 *
 * REGLA CENTRAL:
 *   - Todo lo que carga el PACIENTE es DATO REVISABLE.
 *   - Nace siempre con origin: "patient_reported" y reviewStatus: "pending".
 *   - Se envuelve en ReviewableData<T> — NUNCA en ValidatedData.
 *   - Nunca se valida automáticamente.
 *   - La transición a "accepted" requiere acción explícita del profesional (MC-8).
 *
 * Los registros (meal_logs, weight_logs, patient_notes) son DISTINTOS de:
 *   - measurements (tomadas por profesional, ValidatedData)
 *   - consultations (registradas por profesional, ValidatedData)
 *   - plans/agenda (definidas por profesional, ValidatedData)
 *
 * En MC-7 estos tipos describen datos mock/ficticios de demostración.
 */

import type { ReviewableData } from "./domain.js";

/** Identificador de registro de comida (string opaco). */
export type MealLogId = string;

/** Identificador de registro de peso (string opaco). */
export type WeightLogId = string;

/** Identificador de nota/pregunta del paciente (string opaco). */
export type PatientNoteId = string;

/**
 * Registro de comida cargado por el paciente.
 *
 * DATO REVISABLE / PENDIENTE — no es dato profesional.
 * El paciente lo carga en el formulario de "Registrar comida".
 */
export interface PatientMealLog {
  id: MealLogId;
  patientId: string;
  date: string; // ISO 8601 date
  timeOfDay: "breakfast" | "mid_morning" | "lunch" | "afternoon" | "snack" | "dinner" | "night";
  foodDescription: string; // "desayuno: café, tostadas, mermelada"
  portion?: string; // tamaño/porción reportada por paciente
  notes?: string; // observaciones adicionales
  createdAt: string;
}

/**
 * Registro de peso cargado por el paciente.
 *
 * DATO REVISABLE / PENDIENTE — no es medición profesional.
 * El paciente lo carga desde su báscula y lo reporta.
 */
export interface PatientWeightLog {
  id: WeightLogId;
  patientId: string;
  date: string; // ISO 8601 date
  weight: number; // en kg
  unit: "kg";
  notes?: string; // circunstancias, sensación, observaciones
  createdAt: string;
}

/**
 * Nota o pregunta cargada por el paciente.
 *
 * DATO REVISABLE / PENDIENTE — no es nota profesional.
 * El paciente puede enviar preguntas, consultas, dudas sobre su plan.
 */
export interface PatientNote {
  id: PatientNoteId;
  patientId: string;
  type: "question" | "observation" | "concern";
  subject: string; // "Dudas sobre horarios", "No tengo los ingredientes"
  body: string; // contenido de la pregunta/nota
  createdAt: string;
}

/**
 * Draft de registro de comida (lo que envía el formulario del paciente).
 *
 * No tiene id ni createdAt — esos se generan en el preview/persistencia.
 */
export interface PatientMealLogDraft {
  date: string;
  timeOfDay: "breakfast" | "mid_morning" | "lunch" | "afternoon" | "snack" | "dinner" | "night";
  foodDescription: string;
  portion?: string;
  notes?: string;
}

/**
 * Draft de registro de peso.
 */
export interface PatientWeightLogDraft {
  date: string;
  weight: number;
  notes?: string;
}

/**
 * Draft de nota/pregunta.
 */
export interface PatientNoteDraft {
  type: "question" | "observation" | "concern";
  subject: string;
  body: string;
}

/**
 * Respuesta de preview para un registro de comida.
 *
 * Envuelve PatientMealLog en ReviewableData.
 * NUNCA se persiste en MC-7 — es solo simulación/preview.
 */
export type PatientMealLogReviewable = ReviewableData<PatientMealLog>;

/**
 * Respuesta de preview para un registro de peso.
 *
 * Envuelve PatientWeightLog en ReviewableData.
 * NUNCA se persiste en MC-7 — es solo simulación/preview.
 */
export type PatientWeightLogReviewable = ReviewableData<PatientWeightLog>;

/**
 * Respuesta de preview para una nota/pregunta.
 *
 * Envuelve PatientNote en ReviewableData.
 * NUNCA se persiste en MC-7 — es solo simulación/preview.
 */
export type PatientNoteReviewable = ReviewableData<PatientNote>;

/**
 * Tipo agregado para cualquier entrada revisable del paciente.
 * Útil para listados o bandeja futura (MC-8).
 */
export type PatientReviewableEntryType = "meal_log" | "weight_log" | "note";

export interface PatientReviewableEntry {
  id: string;
  patientId: string;
  entryType: PatientReviewableEntryType;
  createdAt: string;
  reviewStatus: "pending" | "reviewed" | "accepted" | "flagged";
  data: PatientMealLog | PatientWeightLog | PatientNote;
}
