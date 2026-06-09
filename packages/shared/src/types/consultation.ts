/**
 * Tipos del dominio de consultas y mediciones profesionales.
 *
 * REGLA CENTRAL aplicada a consultas:
 *   - Una consulta es un DATO PROFESIONAL/VALIDADO: la carga la profesional.
 *   - Las mediciones incluidas en una consulta son DATO PROFESIONAL/VALIDADO.
 *   - Estos datos NUNCA son ReviewableData: no requieren bandeja de revisión.
 *   - Son distintos de weight_logs (autorreporte del paciente).
 *
 * En MC-4 estos tipos describen datos mock/ficticios de demostración.
 */

/** Identificador de consulta (string opaco). */
export type ConsultationId = string;

/** Estado de una consulta. */
export type ConsultationStatus = "draft" | "completed" | "archived";

/** Unidades de medida para mediciones. */
export type MeasurementUnit =
  | "kg"
  | "cm"
  | "cm²"
  | "%"
  | "bpm"
  | "mmHg";

/** Origen de una medición: siempre profesional en MC-4. */
export type MeasurementSource = "professional";

/** Tipo de medición (peso, altura, cintura, etc.). */
export type MeasurementType =
  | "weight"
  | "height"
  | "waist_circumference"
  | "hip_circumference"
  | "body_fat_percentage"
  | "blood_pressure_systolic"
  | "blood_pressure_diastolic";

/**
 * Una medición tomada por la PROFESIONAL durante una consulta.
 *
 * Esto es DATO PROFESIONAL/VALIDADO. No es dato revisable.
 * Es distinto de weight_logs (que carga el paciente).
 */
export interface ProfessionalMeasurement {
  id: string;
  type: MeasurementType;
  value: number;
  unit: MeasurementUnit;
  source: MeasurementSource;
  takenAt: string; // ISO 8601 datetime
  notes?: string;
}

/**
 * Resumen de una consulta (lista de consultas).
 */
export interface ConsultationSummary {
  id: ConsultationId;
  patientId: string;
  date: string; // ISO 8601 date
  reason: string;
  status: ConsultationStatus;
  createdAt: string;
}

/**
 * Detalle completo de una consulta (vista profesional).
 *
 * Incluye todas las mediciones y observaciones de la profesional.
 * Este es un DATO PROFESIONAL/VALIDADO.
 */
export interface ConsultationDetail extends ConsultationSummary {
  objective: string;
  observations: string;
  professionalNote: string;
  measurements: ReadonlyArray<ProfessionalMeasurement>;
  professionalId: string;
  isDemoData: boolean;
}

/**
 * Draft de una nueva consulta (entrada de formulario).
 *
 * Usado para construir una consulta antes de guardarla.
 */
export interface NewConsultationDraft {
  date: string;
  reason: string;
  objective: string;
  observations: string;
  professionalNote: string;
  measurements: Array<{
    type: MeasurementType;
    value: number;
    unit: MeasurementUnit;
    notes?: string;
  }>;
}

/**
 * Respuesta de preview al crear/simular una nueva consulta.
 *
 * En MC-4 esto es 100% simulación sin persistencia.
 */
export interface ConsultationPreviewResponse {
  consultation: ConsultationDetail;
  meta: {
    demo: true;
    warning: string;
  };
}
