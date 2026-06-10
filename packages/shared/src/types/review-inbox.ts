/**
 * Tipos de la bandeja de revisión profesional — MC-8.
 *
 * REGLA CENTRAL:
 *   - Los registros del paciente son DATOS REVISABLES y permanecen así.
 *   - Las acciones de revisión cambian el reviewStatus pero NO crean ValidatedData.
 *   - No hay validación automática.
 *   - No hay creación de datos profesionales (mediciones, consultas).
 *   - Cada acción es EXPLÍCITA.
 *
 * Los registros en la bandeja (comidas, peso, notas) son instancias de
 * ReviewableData<PatientMealLog | PatientWeightLog | PatientNote>.
 *
 * En MC-8 estos tipos describen datos mock/ficticios de demostración.
 */

import type {
  PatientMealLog,
  PatientWeightLog,
  PatientNote,
  PatientReviewableEntry,
} from "./patient-logs.js";
import type { ReviewableData } from "./domain.js";

/** Tipo de acción que ejecuta la profesional en un registro revisable. */
export type ReviewActionType = "mark_reviewed" | "accept" | "flag" | "comment";

/** Identificador de acción de revisión (string opaco). */
export type ReviewActionId = string;

/**
 * Draft de una acción de revisión.
 *
 * Lo que envía la UI profesional para ejecutar una acción.
 * No persiste — es para preview/simulación.
 */
export interface ReviewActionDraft {
  actionType: ReviewActionType;
  entryId: string; // ID del registro revisable que se está procesando
  comment?: string; // Comentario opcional (si actionType === "comment")
  notes?: string; // Notas adicionales (opcional)
}

/**
 * Preview de una acción de revisión ejecutada.
 *
 * Resultado simulado de ejecutar una acción.
 * Devuelve el registro actualizado con nuevo reviewStatus.
 * Envuelto en ReviewableData — NUNCA se convierte en ValidatedData.
 */
export interface ReviewActionPreview {
  actionId: ReviewActionId;
  actionType: ReviewActionType;
  entryId: string;
  executedBy: string; // ID del profesional (demo: "prof-demo-1")
  executedAt: string; // ISO timestamp
  previousStatus: "pending" | "reviewed" | "accepted" | "flagged";
  newStatus: "pending" | "reviewed" | "accepted" | "flagged";
  // El registro SIGUE siendo ReviewableData — nunca se convierte en ValidatedData
  updatedEntry: ReviewableData<PatientMealLog | PatientWeightLog | PatientNote>;
  comment?: string;
  isDemoData: boolean;
}

/**
 * Ítem de la bandeja de revisión del profesional.
 *
 * Representa un registro del paciente que requiere revisión.
 * Siempre tiene origin: "patient_reported" y reviewStatus: "pending" o superior.
 */
export interface ReviewInboxItem {
  id: string;
  patientId: string;
  patientName: string; // para mostrar en la UI
  entryType: "meal_log" | "weight_log" | "note";
  entry: ReviewableData<PatientMealLog | PatientWeightLog | PatientNote>;
  createdAt: string;
  // Estado de revisión — puede ser pending, reviewed, accepted, flagged
  // Pero el entry SIGUE siendo ReviewableData
  reviewStatus: "pending" | "reviewed" | "accepted" | "flagged";
  lastActionBy?: string; // profesional que hizo la última acción
  lastActionAt?: string;
  comment?: string; // comentario profesional (si la hay)
  isDemoData: boolean;
}

/**
 * Respuesta de la bandeja de revisión.
 *
 * Lista de registros pendientes de revisión.
 */
export interface ReviewInboxResponse {
  items: ReadonlyArray<ReviewInboxItem>;
  totalCount: number;
  filterBy?: "pending" | "all"; // para futuros filtros
}

/**
 * Tipo agregado para estadísticas de la bandeja.
 * Útil para avisos/badges en la UI.
 */
export interface ReviewInboxStats {
  totalPending: number;
  totalReviewed: number;
  totalAccepted: number;
  totalFlagged: number;
  pendingByType: {
    meal_logs: number;
    weight_logs: number;
    notes: number;
  };
}
