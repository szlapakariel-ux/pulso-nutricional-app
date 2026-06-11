/**
 * Tipos de fotos de comidas del paciente (datos revisables) — MC-FOTOS-MVP-1.
 *
 * REGLA CENTRAL:
 *   - Toda foto cargada por el PACIENTE es DATO REVISABLE.
 *   - Nace siempre con origin: "patient_reported" y reviewStatus: "pending".
 *   - Nunca se valida automáticamente.
 *   - Solo la profesional puede cambiar reviewStatus y escribir
 *     professionalComment.
 *
 * STORAGE:
 *   - Postgres guarda SOLO la referencia (storageKey), nunca el binario.
 *   - storageKey se prefiere sobre photoUrl: la URL se deriva de forma
 *     controlada (firmada) al servir; la key es estable.
 *   - NUNCA exponer URLs públicas permanentes.
 *
 * En MC-FOTOS-MVP-1 el upload real del binario NO está implementado:
 * los registros llevan metadata + storageKey reservada. El upload llega
 * en MC-FOTOS-MVP-2 (UI de tomar/subir foto en Mi Pulso).
 */

import type { ReviewStatus } from "./domain.js";

/** Identificador de registro de foto de comida (string opaco). */
export type MealPhotoLogId = string;

/**
 * Tipo de comida fotografiada — vocabulario propio del módulo de fotos.
 *
 * DECISIÓN (ADR 0029): NO converge con timeOfDay de PatientMealLog
 * (7 momentos de agenda). Las fotos usan la lista de producto confirmada
 * en MC-FOTOS-MVP-0: desayuno, almuerzo, merienda, cena, colación, otro.
 *   - snack      → merienda
 *   - collation  → colación
 *   - other      → no encaja en las categorías anteriores
 */
export type MealPhotoType =
  | "breakfast"
  | "lunch"
  | "snack"
  | "dinner"
  | "collation"
  | "other";

/**
 * Registro de foto de comida cargado por el paciente.
 *
 * DATO REVISABLE / PENDIENTE — no es dato profesional.
 * El API devuelve siempre esta metadata, nunca el binario ni URL pública.
 */
export interface MealPhotoLog {
  id: MealPhotoLogId;
  patientId: string;
  /**
   * Key del objeto en el bucket S3-compatible.
   * Patrón: patients/{patientId}/meal-photos/{year}/{month}/{fileId}
   * Generada SIEMPRE en servidor — nunca el nombre original del archivo.
   */
  storageKey: string;
  mealType: MealPhotoType;
  /** Comentario corto opcional del paciente. */
  patientComment?: string;
  /** Comentario de la nutricionista. Solo escribible por rol profesional. */
  professionalComment?: string;
  /** Siempre "patient_reported" — el campo nunca cambia. */
  origin: "patient_reported";
  /** Nace "pending"; solo la profesional lo avanza. */
  reviewStatus: ReviewStatus;
  createdAt: string; // ISO datetime
  /** Cuándo la profesional lo revisó. */
  reviewedAt?: string; // ISO datetime
  /** Id del profesional que revisó. */
  reviewedBy?: string;
}

/**
 * Draft de registro de foto (lo que envía el cliente del paciente).
 * El paciente NUNCA puede mandar professionalComment, reviewStatus ni origin.
 */
export interface MealPhotoLogDraft {
  mealType: MealPhotoType;
  patientComment?: string;
}

/**
 * Acción de revisión profesional sobre una foto.
 * "pending" no es un destino válido: la revisión siempre avanza el estado.
 */
export interface MealPhotoReviewDraft {
  reviewStatus: Exclude<ReviewStatus, "pending">;
  professionalComment?: string;
}
