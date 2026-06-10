/**
 * Mapping demo userId → patientId — MC-MIPULSO-1.
 *
 * ⚠️ BLOQUEO CONOCIDO (documentado, no inventado):
 *
 * La API `GET /auth/me` devuelve el `id` del USUARIO (userId), no el
 * `patientId` del paciente. Para llamar a `GET /patients/:patientId/today`
 * Mi Pulso necesita el patientId.
 *
 * El mapping real userId → patientId vive HOY solo en el guard del backend:
 *   packages/api/src/middleware/auth-guards.ts → DEMO_USER_TO_PATIENT_ID
 *
 * Para que el demo funcione end-to-end sin tocar el backend en este ciclo,
 * replicamos aquí ese mismo mapping demo, documentado. No se inventan IDs:
 * son los userId/patientId ficticios ya definidos en el seed y el guard.
 *
 * PRÓXIMO CICLO (fuera de MC-MIPULSO-1): la API debería exponer el patientId
 * del paciente autenticado (p. ej. `/auth/me` devolviendo `patientId`, o un
 * endpoint `/patients/me`). Cuando exista, este mapping se elimina del
 * frontend.
 */

/** Mapping demo userId (JWT) → patientId (mock / DB). Espejo del backend. */
export const DEMO_USER_TO_PATIENT_ID: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000011": "demo-1",
  "d0000000-0000-0000-0000-000000000012": "demo-2",
  "d0000000-0000-0000-0000-000000000013": "demo-3",
};

/**
 * Resuelve el patientId demo a partir del userId del token.
 * Devuelve null si el userId no está mapeado (p. ej. un profesional).
 */
export function resolveDemoPatientId(userId: string): string | null {
  return DEMO_USER_TO_PATIENT_ID[userId] ?? null;
}
