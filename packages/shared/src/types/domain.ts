/**
 * Tipos del dominio central de Pulso Nutricional.
 *
 * REGLA CENTRAL DEL PRODUCTO:
 *   - Los datos cargados por el PACIENTE son datos REVISABLES.
 *   - Los datos cargados o validados por la PROFESIONAL son datos VALIDADOS.
 *   - Nunca deben mezclarse automáticamente.
 *   - La transición revisable → validado siempre requiere una acción explícita
 *     de la profesional (ver ReviewStatus).
 *
 * Estos tipos son la fuente de verdad para toda la API y para las apps.
 * Se afinarán en MC-3+ cuando se implementen los endpoints de negocio.
 */

/**
 * Origen del dato: quién lo cargó en el sistema.
 * Determina si el dato es revisable o validado.
 */
export type DataOrigin =
  | "patient_reported"      // Cargado por el paciente → dato REVISABLE
  | "professional_validated"; // Cargado o validado por la profesional → dato VALIDADO

/**
 * Estado de revisión de un dato reportado por el paciente.
 *
 * Los datos del paciente nacen siempre en "pending".
 * Solo la profesional puede avanzar el estado — nunca automáticamente.
 *
 * Corresponde a la entidad `review_statuses` del modelo de datos.
 */
export type ReviewStatus =
  | "pending"   // Cargado por el paciente, aún no revisado por la profesional
  | "reviewed"  // La profesional lo vio
  | "accepted"  // La profesional lo aceptó explícitamente
  | "flagged";  // La profesional lo marcó para seguimiento

/**
 * Envuelve cualquier dato del paciente con su estado de revisión.
 * Nunca debe construirse con un estado distinto de "pending" desde el cliente
 * del paciente.
 */
export interface ReviewableData<T> {
  data: T;
  origin: "patient_reported";
  reviewStatus: ReviewStatus;
}

/**
 * Envuelve cualquier dato validado por la profesional.
 * El origen siempre es "professional_validated".
 */
export interface ValidatedData<T> {
  data: T;
  origin: "professional_validated";
}
