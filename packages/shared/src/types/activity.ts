/**
 * Tipos del módulo de actividad física opcional — MC-10.
 *
 * REGLA CENTRAL (doble candado):
 *   1. La profesional habilita el módulo y crea prescripciones.
 *      → Dato profesional / ValidatedData / origin: "professional_validated".
 *   2. El paciente registra su actividad.
 *      → Dato revisable / ReviewableData / origin: "patient_reported" / reviewStatus: "pending".
 *
 * NUNCA:
 *   - Se valida un registro del paciente automáticamente.
 *   - Se mezcla prescripción profesional con registro del paciente.
 *   - Se generan recomendaciones médicas o deportivas automáticas.
 *   - Se incluye professionalNote en datos visibles al paciente.
 *   - Se incluyen métricas avanzadas (GPS, calorías, frecuencia cardíaca, etc.).
 *
 * En MC-10 todos los datos son mock/ficticios de demostración.
 * El módulo puede estar inactivo para un paciente — siempre verificar ActivitySettings.
 */

import type { ReviewableData } from "./domain.js";

/** Identificador de prescripción de ejercicio (string opaco). */
export type ExercisePrescriptionId = string;

/** Identificador de registro de actividad del paciente (string opaco). */
export type ExerciseLogId = string;

/**
 * Tipo de actividad soportado en el módulo opcional.
 *
 * Conjunto acotado para evitar que el módulo se convierta en app deportiva completa.
 */
export type ActivityType =
  | "walking"    // Caminata
  | "gym"        // Gimnasio / ejercicios de fuerza
  | "bike"       // Bicicleta
  | "running"    // Trote / carrera
  | "soccer"     // Fútbol u otros deportes de equipo
  | "mobility"   // Movilidad / elongación / yoga
  | "other";     // Otra actividad no listada

/**
 * Intensidad percibida por el paciente o prescrita por la profesional.
 *
 * Intencionalmente simple — no se calculan calorías ni frecuencia cardíaca.
 */
export type ActivityIntensity = "low" | "moderate" | "high";

/**
 * Estado del módulo de actividad para un paciente dado.
 *
 * Solo la profesional puede activar el módulo — no se activa automáticamente.
 */
export type ActivityModuleStatus = "active" | "inactive";

/**
 * Configuración del módulo de actividad para un paciente.
 *
 * Dato profesional / validado.
 * Determina si el paciente puede registrar actividad en Mi Pulso.
 */
export interface ActivitySettings {
  patientId: string;
  moduleStatus: ActivityModuleStatus;
  /** Fecha en que la profesional activó el módulo (solo si moduleStatus = "active"). */
  activatedAt?: string;
  isDemoData: boolean;
}

/**
 * Prescripción de ejercicio creada por la profesional.
 *
 * DATO PROFESIONAL / VALIDADO.
 * origin: "professional_validated" (implícito por ser prescripción).
 *
 * NUNCA incluye professionalNote en datos visibles al paciente.
 * generalNotes SÍ es visible — es la indicación para el paciente.
 */
export interface ExercisePrescription {
  id: ExercisePrescriptionId;
  patientId: string;
  activityType: ActivityType;
  durationMinutes: number;
  intensity: ActivityIntensity;
  /** Frecuencia recomendada. Texto libre — no se autocalcula ni se hace seguimiento automático. */
  frequency: string;
  /** Indicaciones visibles al paciente. NUNCA es nota interna. */
  generalNotes?: string;
  startDate: string; // ISO 8601 date
  isDemoData: boolean;
}

/**
 * Registro de actividad física cargado por el paciente.
 *
 * DATO REVISABLE / PENDIENTE.
 * origin: "patient_reported" / reviewStatus: "pending".
 *
 * No incluye métricas avanzadas (GPS, calorías, frecuencia cardíaca, etc.).
 * No se valida automáticamente.
 */
export interface PatientExerciseLog {
  id: ExerciseLogId;
  patientId: string;
  date: string; // ISO 8601 date
  activityType: ActivityType;
  durationMinutes: number;
  intensity: ActivityIntensity;
  notes?: string;
  createdAt: string;
}

/**
 * Draft del registro de actividad (lo que envía el formulario del paciente).
 *
 * Sin id ni createdAt — se generan en el preview/persistencia.
 */
export interface PatientExerciseLogDraft {
  date: string;
  activityType: ActivityType;
  durationMinutes: number;
  intensity: ActivityIntensity;
  notes?: string;
}

/**
 * Registro de actividad envuelto como dato revisable.
 *
 * Siempre: origin: "patient_reported" / reviewStatus: "pending".
 * NUNCA: ValidatedData.
 */
export type PatientExerciseLogReviewable = ReviewableData<PatientExerciseLog>;
