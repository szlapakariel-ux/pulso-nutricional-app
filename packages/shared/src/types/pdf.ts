/**
 * Tipos de documentos PDF — MC-9.
 *
 * REGLA CENTRAL:
 *   - Los PDFs se generan EXCLUSIVAMENTE desde datos profesionales/validados.
 *   - NUNCA incluyen ReviewableData (meal_logs, weight_logs, patient_notes).
 *   - NUNCA incluyen registros con reviewStatus: "pending".
 *   - NUNCA incluyen professionalNote ni notas internas.
 *
 * Un PDF de plan contiene:
 *   ✅ Nombre del paciente (visible)
 *   ✅ Plan alimentario (nombre, indicaciones generales, comidas)
 *   ✅ Agenda profesional asignada
 *   ✅ Fecha de generación
 *   ❌ professionalNote (NUNCA)
 *   ❌ meal_logs (NUNCA)
 *   ❌ weight_logs (NUNCA)
 *   ❌ patient_notes (NUNCA)
 *   ❌ review_inbox (NUNCA)
 *   ❌ datos pending (NUNCA)
 *
 * En MC-9 estos tipos describen datos mock/ficticios de demostración.
 */

/** Tipo de documento PDF soportado. */
export type PdfDocumentType = "plan";

/**
 * Metadatos del PDF generado.
 * Documenta explícitamente qué incluye y qué excluye.
 */
export interface PdfPreviewMetadata {
  documentType: PdfDocumentType;
  patientId: string;
  generatedAt: string;
  /** Campos de datos profesionales incluidos en el PDF. */
  includes: ReadonlyArray<
    | "patient_name"
    | "plan_name"
    | "general_indications"
    | "meals"
    | "agenda_items"
  >;
  /** Campos explícitamente excluidos para mantener la separación de dominio. */
  excludes: ReadonlyArray<
    | "professionalNote"
    | "reviewableData"
    | "pending_records"
    | "meal_logs"
    | "weight_logs"
    | "patient_notes"
  >;
  isDemoData: boolean;
}

/**
 * Comida del plan apta para incluir en el PDF.
 * Proyección de MealPlanItem sin campos internos.
 */
export interface PdfMealItem {
  name: string;
  timeHint: string;
  description: string;
  moment: string;
  portionHint?: string;
}

/**
 * Ítem de agenda apto para incluir en el PDF.
 * Proyección de PatientAgendaItem sin campos internos.
 */
export interface PdfAgendaItem {
  title: string;
  timeHint: string;
  description?: string;
  type: string;
  moment: string;
}

/**
 * Datos del plan alimentario para el PDF.
 *
 * Contiene SOLO datos profesionales/validados visibles al paciente.
 * Nunca incluye professionalNote.
 */
export interface PatientPlanPdfData {
  patientName: string;
  planName: string;
  /** Indicaciones generales — visibles al paciente por diseño de dominio. */
  generalIndications: string;
  meals: ReadonlyArray<PdfMealItem>;
  agendaItems: ReadonlyArray<PdfAgendaItem>;
  assignedDate: string;
  generatedAt: string;
  /** Siempre true en MC-9. */
  isDemoData: boolean;
}
