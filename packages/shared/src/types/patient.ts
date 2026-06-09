/**
 * Tipos del dominio de pacientes.
 *
 * REGLA CENTRAL aplicada a pacientes:
 *   - Un paciente es un DATO PROFESIONAL: lo gestiona la profesional.
 *   - Lo que ve el paciente de su propia ficha es LIMITADO (PatientSummary).
 *   - Las notas internas profesionales NUNCA son visibles al paciente
 *     (ver `professionalNote` en PatientDetail).
 *
 * En MC-3 estos tipos describen datos mock/ficticios de demostración.
 * Se afinarán cuando exista persistencia real (MC posteriores).
 */

/** Identificador de paciente (string opaco; no asumir formato). */
export type PatientId = string;

/** Identificador de profesional (string opaco; no asumir formato). */
export type ProfessionalId = string;

/** Estado del vínculo del paciente con la profesional. */
export type PatientStatus = "active" | "inactive" | "pending";

/**
 * Resumen de un paciente para listados.
 * Contiene solo datos no sensibles, aptos para mostrar en una lista.
 */
export interface PatientSummary {
  id: PatientId;
  fullName: string;
  age: number;
  goal: string;
  lastControl: string | null;
  status: PatientStatus;
}

/**
 * Ficha mínima (detalle) de un paciente, vista por la PROFESIONAL.
 *
 * Incluye `professionalNote`: una observación interna que es un DATO
 * PROFESIONAL y NUNCA debe exponerse a la experiencia del paciente.
 */
export interface PatientDetail extends PatientSummary {
  /** Observación visible para la profesional. Dato profesional. */
  professionalNote: string;
  /** Profesional responsable del paciente. */
  professionalId: ProfessionalId;
  /** Marca de datos: en MC-3 siempre true (datos ficticios de demostración). */
  isDemoData: boolean;
}

/** Resumen de una profesional (datos básicos, no sensibles). */
export interface ProfessionalSummary {
  id: ProfessionalId;
  fullName: string;
}

/**
 * Nota de visibilidad: documenta, a nivel de tipo, qué campos de la ficha
 * son visibles para el paciente y cuáles son exclusivos de la profesional.
 * Sirve como recordatorio de contrato hasta que exista control de acceso real.
 */
export interface PatientVisibilityNote {
  visibleToPatient: ReadonlyArray<keyof PatientSummary>;
  professionalOnly: ReadonlyArray<keyof PatientDetail>;
}
