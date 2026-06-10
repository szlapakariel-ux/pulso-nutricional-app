/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN — MC-10.
 *
 * Mock local para la app del paciente (mi-pulso-web).
 * En MC-10 no hay conexión real a la API ni auth real.
 * Se simula que el paciente activo es "demo-1" (tiene el módulo activo).
 *
 * Patrón: mock duplicado intencional hasta que se conecte web ↔ API
 * (documentado en ADR 0011).
 */

/** Simula si el módulo de actividad está habilitado para el paciente demo actual. */
export const DEMO_ACTIVITY_MODULE_ACTIVE = true;

export const DEMO_ACTIVITY_PATIENT_ID = "demo-1";
